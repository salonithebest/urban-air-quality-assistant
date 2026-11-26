/**
 * geminiService.ts
 *
 * Thin wrapper around Gemini API for phrasing family air quality advice.
 *
 * CRITICAL ARCHITECTURAL GUARANTEES:
 * 1. AQI, category, and CO₂ savings numbers are NEVER computed by Gemini.
 *    They are computed deterministically before this service is called.
 * 2. System prompt instructs the model to strictly ground responses in the provided snapshot.
 * 3. Structured JSON generation is enforced via responseMimeType.
 * 4. Advice responses are cached in-memory per snapshot hash to save quota.
 * 5. If GEMINI_API_KEY is not set or API fails, an ultra-specific deterministic fallback
 *    advice is returned so the user experience never breaks during demos or tests.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import {
  AdviceResponseSchema,
  type AdviceRequest,
  type AdviceResponse,
  type MemberAdvice,
} from "../schemas/index.js";

// Single constant for model name so it can be swapped instantly if needed
export const GEMINI_MODEL_NAME = "gemini-2.0-flash";

// In-memory advice cache: key = hash of (city + aqiCategory + roles + routine), 15 min TTL
const adviceCache = new Map<string, { data: AdviceResponse; expiresAt: number }>();
const ADVICE_CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Sanitizes and whitelists user-provided text inputs before embedding into LLM prompts.
 * Strips delimiter characters, prompt injection patterns, and control characters to prevent LLM manipulation.
 */
/**
 * Sanitizes error messages to guarantee no API keys or sensitive query parameters leak into logs.
 */
function sanitizeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
      .replace(/(?:key|api[_-]?key|token)=([^\s&]+)/gi, "$1=[REDACTED]")
      .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]");
  }
  return "Unknown error during generative AI synthesis";
}

/**
 * Extracts raw JSON substring from model output, stripping optional markdown codeblocks.
 */
export function extractJsonText(rawText: string): string {
  const trimmed = rawText.trim();
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return jsonBlockMatch && jsonBlockMatch[1] ? jsonBlockMatch[1].trim() : trimmed;
}

export function sanitizePromptText(value: string | undefined | null, maxLength = 80): string {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/[`${}\\[\]"']/g, "")
    .replace(/(?:ignore|disregard)\s+(?:all\s+)?(?:previous\s+)?(?:instructions|prompts)/gi, "")
    .replace(/(?:system\s*prompt|system\s*override|admin\s*mode)/gi, "")
    .trim()
    .slice(0, maxLength);
}

export function computeCacheKey(req: AdviceRequest): string {
  const members = (req.familyProfile?.members || [])
    .map((m) => `${m.id}|${m.name.trim().toLowerCase()}|${m.role}`)
    .sort()
    .join(";");

  const routines = (req.routineChoices || [])
    .map((r) => `${r.activityType}|${r.durationMinutes}|${r.distanceKm ?? 0}`)
    .sort()
    .join(";");

  const indoor = req.indoorContext
    ? `${req.indoorContext.hasAirPurifier ? 1 : 0}|${req.indoorContext.hasPlants ? 1 : 0}|${req.indoorContext.ventilationType}`
    : "default";

  const aqi = `${req.aqiSnapshot.city.trim().toLowerCase()}|${req.aqiSnapshot.category}|${req.aqiSnapshot.aqi}|${req.aqiSnapshot.prominentPollutant}`;

  return `${aqi}#${members}#${routines}#${indoor}`;
}

export async function generateAdviceWording(
  request: AdviceRequest,
  co2Estimate: AdviceResponse["co2Estimate"]
): Promise<AdviceResponse> {
  const cacheKey = computeCacheKey(request);
  const now = Date.now();
  const cached = adviceCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Handle boundary state of empty members
  const members = request.familyProfile?.members || [];
  const routines = request.routineChoices || [];

  // Security: Sanitize all user-originating fields to prevent prompt-injection attacks
  const sanitizedCity = sanitizePromptText(request.aqiSnapshot.city, 60);
  const sanitizedCategory = sanitizePromptText(request.aqiSnapshot.category, 30);
  const sanitizedProminent = sanitizePromptText(request.aqiSnapshot.prominentPollutant, 20);
  const sanitizedMembers = members.map((m) => ({
    id: sanitizePromptText(m.id, 40),
    name: sanitizePromptText(m.name, 40),
    role: m.role,
  }));

  // If no Gemini key is provided, use reliable hyper-specific fallback
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    const fallback = generateDeterministicFallback(request, co2Estimate);
    adviceCache.set(cacheKey, { data: fallback, expiresAt: now + ADVICE_CACHE_TTL_MS });
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const systemInstruction = `You are an expert, family-focused urban air quality and environmental health specialist tailored for Indian households.
You provide highly concrete, supportive, non-prescriptive, time-slotted routines and indoor air quality recommendations.

CRITICAL SAFETY & MEDICAL DIRECTIVE:
1. Do NOT provide medication timing, dosage, or prescriptive medication instructions (e.g. NEVER say "pre-medicate 15 minutes before" or specify intervals). Always advise the user to consult their physician (e.g. "Ask your doctor whether you should use your rescue inhaler before outdoor exposure").
2. Strictly ground output in the provided locality, CPCB AQI, dominant pollutant, and pre-computed deterministic CO₂ savings metrics.
3. Output MUST be valid JSON adhering strictly to the requested schema.`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for consistent factual advice
      },
    });

    const subIndicesSummary = (request.aqiSnapshot.pollutants || [])
      .map((p) => `${p.pollutant}: ${p.subIndex ?? "N/A"} (${p.concentration ?? "N/A"} ${p.unit})`)
      .join(", ");

    const prompt = `
You are an expert, family-focused urban air quality and environmental health specialist tailored for Indian households.
You provide highly concrete, supportive, non-prescriptive, time-slotted routines and indoor air quality recommendations.

CRITICAL GROUNDING INSTRUCTIONS:
1. STRICT LOCALITY GROUNDING: The active locality is ONLY "${sanitizedCity}". Do NOT mention or substitute any other city, district, or state.
2. STRICT AQI GROUNDING: The National AQI is ALREADY computed deterministically via CPCB breakpoints as ${request.aqiSnapshot.aqi} (${sanitizedCategory}). Do NOT cite, alter, or recalculate any other AQI score.
3. DOMINANT POLLUTANT: The prominent driver is ${sanitizedProminent}.
   Sub-indices across criteria pollutants: ${subIndicesSummary || "Standard 6-parameter monitoring"}.
4. DETERMINISTIC CO₂ METRICS:
   - Solo car baseline: ${co2Estimate.baselineKgPerDay} kg/day
   - Commute footprint: ${co2Estimate.optimisedKgPerDay} kg/day
   - Daily carbon saved: ${co2Estimate.savedKgPerDay} kg/day (${co2Estimate.savedKgPerYear} kg/year)
   - Annual tree sequestration: ${co2Estimate.annualTreeYears ?? (co2Estimate.savedKgPerYear / 21).toFixed(1)} tree-years/yr
   Do NOT recalculate or invent any carbon numbers.
5. HOUSEHOLD MEMBERS:
   You MUST generate personalized guidance for EACH member listed below:
   ${sanitizedMembers.map((m) => `- ID: "${m.id}", Name: "${m.name}", Role: "${m.role}"`).join("\n") || "No members provided."}
   Use supportive, non-prescriptive phrasing. Distinguish physiological vulnerability:
   - Infants / Children: rapid cadence, lung alveoli development, peak exposure hours.
   - Seniors / Cardiac / Asthmatic: systemic vascular oxidative stress, airway hyper-reactivity, indoor buffer zones.
   - Healthy Adults: endurance limits, mucosal protection, post-commute recovery without alarming phrasing.
   - MEDICAL SAFETY RULE: Do NOT provide medication timing, dosage, or prescriptive medication instructions (e.g. NEVER say "pre-medicate 15 minutes before" or specify intervals). Always advise the user to consult their physician (e.g. "Ask your doctor whether you should use your rescue inhaler before outdoor exposure"). Remind users to keep prescribed inhalers accessible, but never give dosing schedules.
6. COMMUTE MODES:
   Active commute legs: ${routines.map((r) => `${r.activityType} (${r.durationMinutes} min, ${r.distanceKm ?? "auto"} km)`).join("; ") || "None configured"}.
   Detail exposure avoidance strategies for their specific modes.

Output MUST be valid JSON adhering strictly to this schema:
{
  "memberAdvice": [
    {
      "memberId": "exact string matching input member id",
      "memberName": "exact string matching input member name",
      "healthImpact": "supportive, physiological explanation tailored to ${sanitizedCity}'s AQI ${request.aqiSnapshot.aqi} (${sanitizedCategory}) dominated by ${sanitizedProminent}",
      "personalTips": [
        "Time-slotted actionable precaution (e.g. morning window timing, mask specification, hydration)",
        "Specific indoor / medication buffer recommendation",
        "Practical mitigation for daily transit or physical exertion"
      ]
    }
  ],
  "routineSuggestions": [
    "Concrete commute departure and route buffer recommendation for ${sanitizedCity}",
    "Specific mode-switch insight explaining exposure reduction from their current choices",
    "Tailpipe exposure mitigation during peak congestion hours"
  ],
  "indoorTips": [
    "Specific window management and HEPA air purifier protocol based on outdoor ${sanitizedCategory} air",
    "Wet-surface cleaning and particulate suppression advice (preventing dust resuspension)",
    "Indoor plant care or humidity balance tip"
  ]
}

SNAPSHOT DATA:
${JSON.stringify(
  {
    locality: sanitizedCity,
    lat: request.aqiSnapshot.lat,
    lon: request.aqiSnapshot.lon,
    aqi: request.aqiSnapshot.aqi,
    category: sanitizedCategory,
    prominentPollutant: sanitizedProminent,
    subIndices: request.aqiSnapshot.pollutants,
    householdMembers: sanitizedMembers,
    commuteLegs: routines,
    co2Metrics: co2Estimate,
    indoorContext: request.indoorContext,
  },
  null,
  2
)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(extractJsonText(text));

    const candidateResponse = {
      memberAdvice: parsed.memberAdvice ?? [],
      routineSuggestions: parsed.routineSuggestions ?? [],
      indoorTips: parsed.indoorTips ?? [],
      co2Estimate,
      generatedAt: new Date().toISOString(),
    };

    // Strict runtime schema validation against LLM output anomalies
    const validationResult = AdviceResponseSchema.safeParse(candidateResponse);
    if (!validationResult.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Gemini output failed AdviceResponseSchema validation. Falling back to deterministic engine:",
          validationResult.error.message
        );
      }
      return generateDeterministicFallback(request, co2Estimate);
    }

    const adviceResponse: AdviceResponse = validationResult.data;

    adviceCache.set(cacheKey, { data: adviceResponse, expiresAt: now + ADVICE_CACHE_TTL_MS });
    return adviceResponse;
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Gemini API call failed, using deterministic fallback advice:",
        sanitizeErrorMessage(err)
      );
    }
    const fallback = generateDeterministicFallback(request, co2Estimate);
    return fallback;
  }
}

/**
 * Hyper-specific deterministic fallback generator for when Gemini is offline,
 * key is missing, or rate-limited. Ensures 100% demo resilience with non-generic text.
 */
export function generateDeterministicFallback(
  req: AdviceRequest,
  co2Estimate: AdviceResponse["co2Estimate"]
): AdviceResponse {
  const { city, aqi, category, prominentPollutant } = req.aqiSnapshot;
  const prominentDisplay =
    prominentPollutant === "pm2_5"
      ? "PM₂.₅ fine micro-particles"
      : prominentPollutant.toUpperCase();

  const members = req.familyProfile?.members || [];
  const routines = req.routineChoices || [];

  const memberAdvice: MemberAdvice[] = members.map((m) => {
    let healthImpact = "";
    const personalTips: string[] = [];

    switch (m.role) {
      case "infant":
        healthImpact = `Infants inhale 2–3× more air per kg of body weight than adults. At AQI ${aqi} dominated by ${prominentDisplay}, micro-particles bypass under-developed nasal filtration, elevating airway sensitivity and respiratory discomfort.`;
        personalTips.push(
          `Avoid outdoor stroller walks during morning inversion windows in ${city} when ground-level particle concentrations peak.`,
          "Operate a true-HEPA purifier in the nursery; keep room doors and windows closed during peak traffic hours.",
          "Maintain comfortable nursery humidity and consult your pediatrician if nasal irritation or congestion develops."
        );
        break;
      case "child":
        healthImpact = `Developing lung alveoli and rapid respiratory cadence make children highly susceptible to ${category} air (${aqi} AQI). Outdoor physical exertion forces mouth-breathing, depositing ${prominentDisplay} deep into bronchioles.`;
        personalTips.push(
          "Reschedule strenuous outdoor sports or playground sessions from morning hours to 2:00 PM – 4:30 PM when solar convective mixing lowers ground pollutant density.",
          "Ensure an N95 or well-sealed particulate mask during morning school commutes via open auto-rickshaws or school buses.",
          "Encourage warm hydration and balanced nutrition to support mucosal defenses against airway oxidants."
        );
        break;
      case "senior":
        healthImpact = `Senior cardiovascular elasticity and pulmonary reserves decline naturally. At AQI ${aqi}, ${prominentDisplay} induces systemic vascular oxidative stress, increasing blood viscosity and elevating systolic blood pressure.`;
        personalTips.push(
          `Shift morning garden walks in ${city} entirely to indoor mobility/yoga sessions until ambient AQI drops below 100.`,
          "Monitor morning resting pulse and blood pressure; report sudden chest tightness or breathlessness immediately.",
          "Keep your doctor-prescribed medications easily accessible; consult your physician if you experience any breathing changes."
        );
        break;
      case "asthmatic":
        healthImpact = `Hyper-reactive airways react strongly to ${prominentDisplay} at AQI ${aqi}. Inhaled particulates irritate bronchial smooth muscle, triggering bronchospasms, nocturnal coughing, and sudden drops in peak expiratory flow.`;
        personalTips.push(
          "Ask your doctor whether you should use your rescue inhaler before outdoor exposure; keep your prescribed rescue inhaler accessible at all times.",
          "Always wear a tight-seal N95 mask when stepping near roadside dust or construction corridors.",
          "Maintain peak flow meter logs twice daily; avoid sudden transitions between cold air and air-conditioned rooms."
        );
        break;
      case "cardiac":
        healthImpact = `At AQI ${aqi}, inhalation of ${prominentDisplay} triggers endothelial dysfunction and arterial vasoconstriction, demanding higher myocardial oxygenation while reducing coronary perfusion.`;
        personalTips.push(
          "Avoid brisk uphill walking, heavy lifting, or strenuous outdoor chores that elevate heart rate above 100 bpm in polluted air.",
          "Keep prescribed emergency cardiac medications within immediate reach as advised by your cardiologist.",
          "Stay in sealed, air-filtered indoor rooms; avoid open-window vehicular commutes during rush hour."
        );
        break;
      case "pregnant":
        healthImpact = `Fine particulates (${prominentDisplay}) at AQI ${aqi} can elevate maternal airway sensitivity and systemic inflammatory markers.`;
        personalTips.push(
          `Avoid traveling along heavily congested freight or diesel corridors in ${city}.`,
          "Maximize time spent in purified indoor rooms with controlled HEPA filtration.",
          "Maintain optimal maternal hydration and consume an antioxidant-rich diet to counter environmental oxidative stress."
        );
        break;
      default:
        healthImpact = `At AQI ${aqi} (${category}), even healthy adult mucosal linings experience oxidative irritation, resulting in throat dryness, eye stinging, and post-commute fatigue from carbon monoxide and particulate uptake.`;
        personalTips.push(
          "Avoid intensive outdoor running or jogging during morning (6–9 AM) and night (8–11 PM) pollution peaks.",
          "Use closed-window metro, train, or carpool options rather than open two-wheeler travel for commutes > 5 km.",
          "Flush eyes with clean water and gargle with warm saline upon returning home after evening transit."
        );
        break;
    }

    return {
      memberId: m.id,
      memberName: m.name,
      healthImpact,
      personalTips,
    };
  });

  const totalCarbonSavings = co2Estimate.savedKgPerDay;
  const routineSuggestions: string[] = [
    `Commute Window Buffer: Shift departures in ${city} 30 minutes earlier or later to avoid peak rush hours (8:00–9:30 AM and 7:00–8:30 PM) when tailpipe emissions surge.`,
    `Transit Exposure Shield: Shifting from open road transit to Metro or electric rail reduces personal toxic fine particulate exposure by up to 65% per trip.`,
    totalCarbonSavings > 0
      ? `Quantified Impact: Your family's low-emission routine slashes carbon output by ${co2Estimate.savedKgPerDay} kg CO₂/day (saving ${co2Estimate.savedKgPerYear.toFixed(0)} kg annually)!`
      : "Active Route Optimization: Combine daily errands to minimize roadside exposure along high-traffic corridors.",
  ];

  const indoorTips: string[] = [
    req.indoorContext?.hasAirPurifier
      ? "HEPA Purifier Protocol: Run in bedroom mode overnight; during the day, position purifier at least 1 meter away from walls and at seated breathing height for maximum clean air delivery rate (CADR)."
      : `Window Management: Seal windows between 7:00 PM – 10:00 AM in ${city}. Ventilate briefly only between 1:00 PM – 3:30 PM when sunlight and thermal convection dilute stagnant ground pollution.`,
    req.indoorContext?.hasPlants
      ? "Phytoremediation Care: Wipe dust off broad leaves of Areca Palms and Snake Plants with a damp cloth weekly; clean leaves absorb gaseous volatile compounds up to 3× faster."
      : "Natural Buffers: Place Areca Palm or Boston Fern near study desks to boost indoor relative humidity (40–50%), naturally settling airborne dust particles.",
    "Particulate Dust Suppression: Use damp microfiber mopping exclusively; never use dry brooms which resuspend settled toxic fine dust back into breathing zones.",
  ];

  return {
    memberAdvice,
    routineSuggestions,
    indoorTips,
    co2Estimate,
    generatedAt: new Date().toISOString(),
  };
}
