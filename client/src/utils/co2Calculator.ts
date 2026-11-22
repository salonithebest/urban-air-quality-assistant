import type { RoutineChoice, ActivityType } from "../types/index.js";

export interface Co2Metrics {
  totalMinutes: number;
  totalKm: number;
  wfhMinutes: number;
  soloCarBaselineKg: number;
  routineFootprintKg: number;
  dailyCarbonCutKg: number;
  percentReduction: number;
  savedKgPerYear: number;
  annualTreeYears: number;
  equivalentTreeDays: number;
  sourceLabel: string;
}

// Mid-range India-specific emission factors (kg CO2 / km)
// Sourced from India GHG Program / Shakti Sustainable Energy Foundation & TERI
const EMISSION_FACTORS: Record<ActivityType, number> = {
  car: 0.14,          // Solo petrol hatchback/sedan
  bike: 0.04,         // 2-wheeler petrol scooter / bike
  autorickshaw: 0.09, // CNG 3-wheeler auto
  metro: 0.032,       // Metro / Suburban electric rail (grid-allocated)
  walk: 0.0,          // Zero tailpipe emissions
  wfh: 0.0,           // Zero commute emissions
};

const DEFAULT_SPEED_KMH: Record<ActivityType, number> = {
  car: 25,
  bike: 30,
  autorickshaw: 20,
  metro: 35,
  walk: 5,
  wfh: 0,
};

const KG_CO2_PER_TREE_PER_YEAR = 21; // USDA Forest Service standard

export function calculateDeterministicCo2(choices: RoutineChoice[]): Co2Metrics {
  if (!choices || choices.length === 0) {
    return {
      totalMinutes: 0,
      totalKm: 0,
      wfhMinutes: 0,
      soloCarBaselineKg: 0,
      routineFootprintKg: 0,
      dailyCarbonCutKg: 0,
      percentReduction: 0,
      savedKgPerYear: 0,
      annualTreeYears: 0,
      equivalentTreeDays: 0,
      sourceLabel: "Zero commute legs configured",
    };
  }

  let totalMinutes = 0;
  let totalKm = 0;
  let wfhMinutes = 0;
  let soloCarBaselineKg = 0;
  let routineFootprintKg = 0;

  for (const choice of choices) {
    const isWfh = choice.activityType === "wfh";
    const mins = Math.max(0, choice.durationMinutes || 0);

    if (isWfh) {
      wfhMinutes += mins;
      // WFH has zero commute distance and zero tailpipe emissions
    } else {
      const km =
        choice.distanceKm !== undefined && choice.distanceKm >= 0
          ? choice.distanceKm
          : (DEFAULT_SPEED_KMH[choice.activityType] * mins) / 60;

      totalMinutes += mins;
      totalKm += km;

      // Solo petrol car baseline = km * 0.14 kg CO2/km
      soloCarBaselineKg += km * EMISSION_FACTORS.car;

      // Routine footprint = km * mode factor
      const factor = EMISSION_FACTORS[choice.activityType] ?? 0;
      routineFootprintKg += km * factor;
    }
  }

  const dailyCarbonCutKg = Math.max(0, soloCarBaselineKg - routineFootprintKg);
  const percentReduction =
    soloCarBaselineKg > 0 ? (dailyCarbonCutKg / soloCarBaselineKg) * 100 : 0;
  const savedKgPerYear = dailyCarbonCutKg * 365;

  // Annual tree sequestration: 21 kg CO2 absorbed per tree per year
  const annualTreeYears = savedKgPerYear / KG_CO2_PER_TREE_PER_YEAR;

  // Tree-days: (savedKgPerYear / 21) * 365 (or savedKgPerDay / (21/365))
  const equivalentTreeDays = annualTreeYears * 365;

  return {
    totalMinutes,
    totalKm: Math.round(totalKm * 10) / 10,
    wfhMinutes,
    soloCarBaselineKg: Math.round(soloCarBaselineKg * 100) / 100,
    routineFootprintKg: Math.round(routineFootprintKg * 100) / 100,
    dailyCarbonCutKg: Math.round(dailyCarbonCutKg * 100) / 100,
    percentReduction: Math.min(100, Math.max(0, Math.round(percentReduction))),
    savedKgPerYear: Math.round(savedKgPerYear * 10) / 10,
    annualTreeYears: Math.round(annualTreeYears * 10) / 10,
    equivalentTreeDays: Math.round(equivalentTreeDays * 10) / 10,
    sourceLabel: "India GHG Program (0.14 kg CO₂/km baseline) & TERI",
  };
}
