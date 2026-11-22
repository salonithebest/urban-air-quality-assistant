/**
 * co2Engine.ts
 *
 * Pure, deterministic CO₂ savings calculator.
 *
 * Given a list of routine choices (commute modes + distances), it:
 *  1. Computes a "baseline" — what the user would emit if they drove
 *     the same total distance by car.
 *  2. Computes the actual CO₂ for the chosen mix of modes.
 *  3. Returns savings: kg saved per day, per year, tree-years, and tree-day equivalent.
 *
 * All values are approximate — see emissionFactors.ts for sourcing notes.
 * No I/O, no network calls, no side effects.
 */

import {
  EMISSION_FACTORS,
  KG_CO2_PER_TREE_PER_YEAR,
} from "../config/emissionFactors.js";
import type { Co2Estimate, RoutineChoice } from "../schemas/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Estimate distance from duration if distanceKm is not provided.
 * Uses a rough average speed per mode in urban India.
 */
function estimateDistanceKm(
  activityType: string,
  durationMinutes: number
): number {
  if (activityType === "wfh") return 0;

  const avgSpeedKmPerHour: Record<string, number> = {
    car: 25, // urban Indian traffic average
    bike: 30,
    autorickshaw: 20,
    metro: 35,
    walk: 5,
    wfh: 0,
  };
  const speed = avgSpeedKmPerHour[activityType] ?? 0;
  return (speed * Math.max(0, durationMinutes)) / 60;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate CO₂ savings from a set of routine commute choices.
 *
 * @param choices - Array of routine choices from the user
 * @returns Co2Estimate object with baseline, optimised, and savings values
 */
export function estimateCo2(choices: RoutineChoice[]): Co2Estimate {
  if (!choices || choices.length === 0) {
    return {
      baselineKgPerDay: 0,
      optimisedKgPerDay: 0,
      savedKgPerDay: 0,
      savedKgPerYear: 0,
      annualTreeYears: 0,
      equivalentTreeDays: 0,
      percentReduction: 0,
      sourceLabel: "Zero commute baseline",
    };
  }

  let baselineKgPerDay = 0;
  let optimisedKgPerDay = 0;

  for (const choice of choices) {
    const isWfh = choice.activityType === "wfh";
    const mins = Math.max(0, choice.durationMinutes || 0);

    // WFH strictly generates 0 km transit distance
    const distanceKm = isWfh
      ? 0
      : choice.distanceKm !== undefined && choice.distanceKm >= 0
      ? choice.distanceKm
      : estimateDistanceKm(choice.activityType, mins);

    if (!isWfh) {
      // Baseline: what would the same journey cost by solo petrol car?
      const carFactor = EMISSION_FACTORS["car"]?.kgPerKm ?? 0.14;
      baselineKgPerDay += distanceKm * carFactor;

      // Actual: chosen mode's emission factor
      const factor = EMISSION_FACTORS[choice.activityType];
      const actualFactor = factor?.kgPerKm ?? 0;
      optimisedKgPerDay += distanceKm * actualFactor;
    }
  }

  const savedKgPerDay = Math.max(0, baselineKgPerDay - optimisedKgPerDay);
  const savedKgPerYear = savedKgPerDay * 365;
  const annualTreeYears =
    KG_CO2_PER_TREE_PER_YEAR > 0 ? savedKgPerYear / KG_CO2_PER_TREE_PER_YEAR : 0;
  const equivalentTreeDays = annualTreeYears * 365;
  const percentReduction =
    baselineKgPerDay > 0 ? Math.min(100, (savedKgPerDay / baselineKgPerDay) * 100) : 0;

  // Build a source label from the unique sources used
  const usedSources = new Set<string>();
  for (const choice of choices) {
    if (choice.activityType !== "wfh") {
      const factor = EMISSION_FACTORS[choice.activityType];
      if (factor && factor.source !== "—") usedSources.add(factor.source);
    }
  }
  // Always include car baseline source if there was active travel
  const carSource = EMISSION_FACTORS["car"]?.source;
  if (carSource && baselineKgPerDay > 0) usedSources.add(carSource);

  const sourceLabel =
    usedSources.size > 0
      ? `Approx. — ${[...usedSources].join("; ")}`
      : "Approximate estimate";

  return {
    baselineKgPerDay: round2(baselineKgPerDay),
    optimisedKgPerDay: round2(optimisedKgPerDay),
    savedKgPerDay: round2(savedKgPerDay),
    savedKgPerYear: round2(savedKgPerYear),
    annualTreeYears: round2(annualTreeYears),
    equivalentTreeDays: round2(equivalentTreeDays),
    percentReduction: Math.round(percentReduction),
    sourceLabel,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
