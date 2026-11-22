/**
 * co2Engine.ts
 *
 * Pure, deterministic CO₂ savings calculator.
 *
 * Given a list of routine choices (commute modes + distances), it:
 *  1. Computes a "baseline" — what the user would emit if they drove
 *     the same total distance by car.
 *  2. Computes the actual CO₂ for the chosen mix of modes.
 *  3. Returns savings: kg saved per day, per year, and tree-day equivalent.
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
 * Uses a rough average speed per mode.
 */
function estimateDistanceKm(
  activityType: string,
  durationMinutes: number
): number {
  const avgSpeedKmPerHour: Record<string, number> = {
    car: 25,          // urban Indian traffic average
    bike: 30,
    autorickshaw: 20,
    metro: 35,
    walk: 5,
    wfh: 0,
  };
  const speed = avgSpeedKmPerHour[activityType] ?? 0;
  return (speed * durationMinutes) / 60;
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
  let baselineKgPerDay = 0;
  let optimisedKgPerDay = 0;

  for (const choice of choices) {
    const distanceKm =
      choice.distanceKm !== undefined && choice.distanceKm > 0
        ? choice.distanceKm
        : estimateDistanceKm(choice.activityType, choice.durationMinutes);

    // Baseline: what would the same journey cost by car?
    const carFactor = EMISSION_FACTORS["car"]?.kgPerKm ?? 0.14;
    baselineKgPerDay += distanceKm * carFactor;

    // Actual: chosen mode's emission factor
    const factor = EMISSION_FACTORS[choice.activityType];
    const actualFactor = factor?.kgPerKm ?? 0;
    optimisedKgPerDay += distanceKm * actualFactor;
  }

  const savedKgPerDay = Math.max(0, baselineKgPerDay - optimisedKgPerDay);
  const savedKgPerYear = savedKgPerDay * 365;
  const equivalentTreeDays =
    KG_CO2_PER_TREE_PER_YEAR > 0
      ? (savedKgPerYear / KG_CO2_PER_TREE_PER_YEAR) * 365
      : 0;

  // Build a source label from the unique sources used
  const usedSources = new Set<string>();
  for (const choice of choices) {
    const factor = EMISSION_FACTORS[choice.activityType];
    if (factor && factor.source !== "—") usedSources.add(factor.source);
  }
  // Always include car baseline source
  const carSource = EMISSION_FACTORS["car"]?.source;
  if (carSource) usedSources.add(carSource);

  const sourceLabel =
    usedSources.size > 0
      ? `Approx. — ${[...usedSources].join("; ")}`
      : "Approximate estimate";

  return {
    baselineKgPerDay: round2(baselineKgPerDay),
    optimisedKgPerDay: round2(optimisedKgPerDay),
    savedKgPerDay: round2(savedKgPerDay),
    savedKgPerYear: round2(savedKgPerYear),
    equivalentTreeDays: round2(equivalentTreeDays),
    sourceLabel,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
