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
 * 5. If GEMINI_API_KEY is not set or API fails, a deterministic fallback advice
 *    is returned so the user experience never breaks during demos or tests.
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
  return `${req.aqiSnapshot.city}:${req.aqiSnapshot.category}:${roles}:${routines}`;
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

  // If no Gemini key is provided, use reliable deterministic fallback
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
You are an expert, family-focused urban air quality advisor for Indian cities.
You give actionable, empathetic health routines and indoor air quality recommendations.

CRITICAL INSTRUCTIONS:
1. Do NOT recalculate or invent any AQI, pollutant, or CO₂ numbers.
2. The AQI is ALREADY computed as ${request.aqiSnapshot.aqi} (${request.aqiSnapshot.category}) with prominent pollutant: ${request.aqiSnapshot.prominentPollutant}.
3. The CO₂ saved per day is ALREADY computed as ${co2Estimate.savedKgPerDay} kg/day.
4. Output MUST be valid JSON adhering strictly to this shape:
{
  "memberAdvice": [
    {
      "memberId": "string matching input",
      "memberName": "string matching input",
      "healthImpact": "concise explanation of health risks for this specific age/condition under ${request.aqiSnapshot.category} air",
      "personalTips": ["tip 1", "tip 2", "tip 3"]
    }
  ],
  "routineSuggestions": ["actionable commute / activity advice"],
  "indoorTips": ["indoor ventilation, air purifier, or plant tips"]
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
 * Deterministic fallback generator for when Gemini is offline, key is missing,
 * or rate-limited. Ensures 100% uptime and seamless demo capability.
 */
export function generateDeterministicFallback(
  req: AdviceRequest,
  co2Estimate: AdviceResponse["co2Estimate"]
): AdviceResponse {
  const category = req.aqiSnapshot.category;

  const memberAdvice: MemberAdvice[] = req.familyProfile.members.map((m) => {
    let healthImpact = "";
    const personalTips: string[] = [];

    switch (m.role) {
      case "infant":
      case "child":
        healthImpact = `Developing lungs are particularly vulnerable to ${category} air quality. Fine particulates can cause irritation and bronchial spasms.`;
        personalTips.push(
          "Avoid outdoor play during morning rush hours when pollution peaks.",
          "Keep indoor play areas clean and dust-free.",
          "Ensure hydration to help soothe respiratory passages."
        );
        break;
      case "senior":
      case "cardiac":
      case "asthmatic":
        healthImpact = `${category} air increases cardiovascular stress and triggers asthmatic flare-ups or shortness of breath.`;
        personalTips.push(
          "Keep prescribed inhalers/medications readily accessible.",
          "Wear a well-fitted N95 mask if stepping outdoors is unavoidable.",
          "Replace outdoor walks with light indoor mobility exercises."
        );
        break;
      case "pregnant":
        healthImpact = `Elevated pollutant levels may reduce blood oxygenation and elevate systemic inflammation during pregnancy.`;
        personalTips.push(
          "Avoid walking near arterial roads or major traffic intersections.",
          "Stay in well-ventilated, purified indoor spaces when AQI is elevated."
        );
        break;
      default:
        healthImpact = `Prolonged outdoor exposure in ${category} air can cause throat irritation, headaches, and fatigue.`;
        personalTips.push(
          "Limit high-intensity cardio exercises outdoors.",
          "Consider carpooling or public transit to cut exposure and emissions."
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
    `Shift travel away from peak smog hours (early morning 6-9 AM and evening 7-10 PM).`,
    `Opt for Metro or covered transit when traveling more than 5 km to lower your personal exposure.`,
    `By adopting your low-emission routine, your family saves ${co2Estimate.savedKgPerDay} kg of CO₂ every day!`,
  ];

  const indoorTips: string[] = [
    req.indoorContext?.hasAirPurifier
      ? "Run HEPA air purifier on medium/auto setting in sleeping quarters."
      : "Keep doors and windows sealed during peak traffic hours to prevent outdoor smog ingress.",
    req.indoorContext?.hasPlants
      ? "Wipe leaves of indoor air-filtering plants (Snake Plant, Areca Palm) to maximize gas exchange."
      : "Consider adding Areca Palm or Spider Plants for natural indoor humidity and air freshening.",
    "Use wet mopping instead of dry broom sweeping to avoid resuspending particulate dust.",
  ];

  return {
    memberAdvice,
    routineSuggestions,
    indoorTips,
    co2Estimate,
    generatedAt: new Date().toISOString(),
  };
}
