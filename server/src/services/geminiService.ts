/**
 * geminiService.ts
 *
 * Thin wrapper around Gemini API for phrasing family air quality advice.
 *
 * CRITICAL ARCHITECTURAL GUARANTEES:
 * 1. AQI, category, and CO₂ savings numbers are NEVER computed by Gemini.
 *    They are computed deterministically before this service is called.
 * 2. System prompt instructs the model to NEVER recalculate or alter numbers.
 * 3. Structured JSON generation is enforced via responseMimeType.
 * 4. Advice responses are cached in-memory per snapshot hash to save quota.
 * 5. If GEMINI_API_KEY is not set or API fails, an ultra-specific deterministic fallback
 *    advice is returned so the user experience never breaks during demos or tests.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import type {
  AdviceRequest,
  AdviceResponse,
  MemberAdvice,
} from "../schemas/index.js";

// Single constant for model name so it can be swapped instantly if needed
export const GEMINI_MODEL_NAME = "gemini-2.0-flash";

// In-memory advice cache: key = hash of (city + aqiCategory + roles + routine), 15 min TTL
const adviceCache = new Map<string, { data: AdviceResponse; expiresAt: number }>();
const ADVICE_CACHE_TTL_MS = 15 * 60 * 1000;

function computeCacheKey(req: AdviceRequest): string {
  const roles = req.familyProfile.members.map((m) => m.role).sort().join(",");
  const routines = req.routineChoices.map((r) => r.activityType).sort().join(",");
  return `${req.aqiSnapshot.city}:${req.aqiSnapshot.category}:${req.aqiSnapshot.aqi}:${roles}:${routines}`;
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

  // If no Gemini key is provided, use reliable hyper-specific fallback
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    const fallback = generateDeterministicFallback(request, co2Estimate);
    adviceCache.set(cacheKey, { data: fallback, expiresAt: now + ADVICE_CACHE_TTL_MS });
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for consistent factual advice
      },
    });

    const prompt = `
You are an expert, family-focused urban air quality and environmental health specialist tailored for Indian metropolitan and tier-2 households.
You provide highly concrete, actionable, time-slotted routines and indoor air quality recommendations.

CRITICAL INSTRUCTIONS:
1. Do NOT recalculate or invent any AQI, pollutant concentration, or CO₂ figures.
2. The AQI is ALREADY computed as ${request.aqiSnapshot.aqi} (${request.aqiSnapshot.category}) with prominent pollutant: ${request.aqiSnapshot.prominentPollutant}.
3. The CO₂ saved per day is ALREADY computed as ${co2Estimate.savedKgPerDay} kg/day (${co2Estimate.savedKgPerYear} kg/yr).
4. Do NOT output generic platitudes (e.g., "stay indoors"). Be hyper-specific:
   - Provide concrete time windows for outdoor exposure vs. staying indoors in ${request.aqiSnapshot.city}.
   - Distinguish biological physiological risks: why an infant, senior, or asthmatic requires a stricter exposure threshold than a healthy adult at AQI ${request.aqiSnapshot.aqi}.
   - Directly reference the prominent pollutant (${request.aqiSnapshot.prominentPollutant}) and explain its specific biological penetration (e.g., PM2.5 alveolar absorption vs. Ozone epithelial irritation).
   - Detail commute trade-offs based on the user's specific routine modes (${request.routineChoices.map(r => r.activityType).join(", ")}).
5. Output MUST be valid JSON adhering strictly to this schema:
{
  "memberAdvice": [
    {
      "memberId": "string matching input member id",
      "memberName": "string matching input member name",
      "healthImpact": "detailed, medically grounded explanation of why this specific age/condition is uniquely vulnerable at AQI ${request.aqiSnapshot.aqi} (${request.aqiSnapshot.category}) dominated by ${request.aqiSnapshot.prominentPollutant}",
      "personalTips": [
        "Time-slotted actionable precaution (e.g. window timing, mask specification, hydration)",
        "Specific indoor / medication buffer recommendation",
        "Actionable mitigation for daily transit or physical exertion"
      ]
    }
  ],
  "routineSuggestions": [
    "Concrete commute departure and route buffer recommendation for ${request.aqiSnapshot.city}",
    "Specific mode-switch insight explaining exposure reduction from their current choices",
    "Tailpipe exposure mitigation during peak congestion hours"
  ],
  "indoorTips": [
    "Specific window management and HEPA air purifier protocol based on outdoor ${request.aqiSnapshot.category} air",
    "Wet-surface cleaning and particulate suppression advice (preventing dust resuspension)",
    "Indoor plant care or humidity balance tip"
  ]
}

INPUT DATA:
${JSON.stringify(
  {
    city: request.aqiSnapshot.city,
    aqi: request.aqiSnapshot.aqi,
    category: request.aqiSnapshot.category,
    prominentPollutant: request.aqiSnapshot.prominentPollutant,
    familyMembers: request.familyProfile.members,
    routineChoices: request.routineChoices,
    indoorContext: request.indoorContext,
  },
  null,
  2
)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    const adviceResponse: AdviceResponse = {
      memberAdvice: parsed.memberAdvice ?? [],
      routineSuggestions: parsed.routineSuggestions ?? [],
      indoorTips: parsed.indoorTips ?? [],
      co2Estimate,
      generatedAt: new Date().toISOString(),
    };

    adviceCache.set(cacheKey, { data: adviceResponse, expiresAt: now + ADVICE_CACHE_TTL_MS });
    return adviceResponse;
  } catch (err) {
    console.warn("Gemini API call failed, using deterministic fallback advice:", err);
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
  const prominentDisplay = prominentPollutant === "pm2_5" ? "PM₂.₅ fine micro-particles" : prominentPollutant.toUpperCase();

  const memberAdvice: MemberAdvice[] = req.familyProfile.members.map((m) => {
    let healthImpact = "";
    const personalTips: string[] = [];

    switch (m.role) {
      case "infant":
        healthImpact = `Infants inhale 2–3× more air per kg of body weight than adults. At AQI ${aqi} dominated by ${prominentDisplay}, micro-particles bypass under-developed nasal cilia and penetrate alveolar membranes, elevating wheezing and airway inflammation risks.`;
        personalTips.push(
          `Eliminate outdoor stroller walks between 6:00 AM – 9:30 AM in ${city} when thermal inversion traps heavy tailpipe pollutants near ground level.`,
          "Operate a true-HEPA purifier in the nursery; keep room doors closed during peak traffic hours.",
          "Perform regular gentle nasal saline moistening to prevent particulate dry-crusting in nasal passages."
        );
        break;
      case "child":
        healthImpact = `Developing lung alveoli and rapid respiratory cadence make children highly susceptible to ${category} air (${aqi} AQI). Outdoor physical exertion forces mouth-breathing, depositing ${prominentDisplay} deep into bronchioles.`;
        personalTips.push(
          "Reschedule strenuous outdoor sports or playground sessions from morning hours to 2:00 PM – 4:30 PM when solar convective mixing lowers ground pollutant density.",
          "Ensure an N95 or well-sealed particulate mask during morning school commutes via open auto-rickshaws or school buses.",
          "Encourage warm hydration and vitamin C rich citrus fruits to boost mucosal defense against airway oxidants."
        );
        break;
      case "senior":
        healthImpact = `Senior cardiovascular elasticity and pulmonary reserves decline naturally. At AQI ${aqi}, ${prominentDisplay} induces systemic vascular oxidative stress, increasing blood viscosity and elevating systolic blood pressure.`;
        personalTips.push(
          `Shift morning garden walks in ${city} entirely to indoor mobility/yoga sessions until ambient AQI drops below 100.`,
          "Monitor morning resting pulse and blood pressure; report sudden chest tightness or breathlessness immediately.",
          "Keep essential bronchodilator sprays or cardiovascular medications on the bedside table for immediate reach."
        );
        break;
      case "asthmatic":
        healthImpact = `Hyper-reactive airways react strongly to ${prominentDisplay} at AQI ${aqi}. Inhaled particulates irritate bronchial smooth muscle, triggering bronchospasms, nocturnal coughing, and sudden drops in peak expiratory flow.`;
        personalTips.push(
          "Pre-medicate with prescribed preventive inhalers 20 minutes prior to any unavoidable outdoor transit.",
          "Always wear a tight-seal N95 mask when stepping near roadside dust or construction corridors.",
          "Maintain peak flow meter logs twice daily; avoid sudden transitions between cold air and air-conditioned rooms."
        );
        break;
      case "cardiac":
        healthImpact = `At AQI ${aqi}, inhalation of ${prominentDisplay} triggers endothelial dysfunction and arterial vasoconstriction, demanding higher myocardial oxygenation while reducing coronary perfusion.`;
        personalTips.push(
          "Avoid brisk uphill walking, heavy lifting, or strenuous outdoor chores that elevate heart rate above 100 bpm in polluted air.",
          "Keep emergency nitrates/prescribed cardiac medication on hand at all times.",
          "Stay in sealed, air-filtered indoor rooms; avoid open-window vehicular commutes during rush hour."
        );
        break;
      case "pregnant":
        healthImpact = `Fine particulates (${prominentDisplay}) at AQI ${aqi} cross alveolar-capillary barriers into maternal circulation, causing mild placental hypoperfusion and increased maternal systemic inflammation.`;
        personalTips.push(
          `Avoid traveling along heavily congested freight or diesel corridors in ${city}.`,
          "Maximize time spent in purified indoor rooms with controlled HEPA filtration.",
          "Maintain optimal maternal hydration and consume antioxidant-rich diet (spinach, nuts, amla) to counter oxidative stress."
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

  const routineSuggestions: string[] = [
    `Commute Window Buffer: Shift departures in ${city} 30 minutes earlier or later to avoid peak rush hours (8:00–9:30 AM and 7:00–8:30 PM) when tailpipe emissions surge.`,
    `Transit Exposure Shield: Shifting from open road transit to Metro or rail reduces personal toxic fine particulate exposure by up to 65% per trip.`,
    `Quantified Impact: Your family's low-emission routine slashes carbon output by ${co2Estimate.savedKgPerDay} kg CO₂/day (saving ${co2Estimate.savedKgPerYear.toFixed(0)} kg annually)!`,
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
