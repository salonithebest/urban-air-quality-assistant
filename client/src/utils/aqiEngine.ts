/**
 * aqiEngine.ts
 *
 * Pure, deterministic implementation of the CPCB National AQI sub-index
 * calculation method.
 *
 * Rules:
 *  - Each pollutant concentration maps to a sub-index via linear interpolation
 *    between the two nearest CPCB breakpoint values.
 *  - Final AQI = max of all valid sub-indices.
 *  - Minimum data rule: at least 3 pollutants must have valid (non-null)
 *    concentrations, and at least one must be PM₂.₅ or PM₁₀.
 *  - Sub-index is capped at 500.
 *  - CO must be passed in mg/m³ (divide Open-Meteo's µg/m³ value by 1000
 *    BEFORE calling this engine).
 *
 * References:
 *  - CPCB "National Air Quality Index" technical document (2014)
 *  - ies.gov.in breakpoint tables
 */

import type {
  Category,
  PollutantId,
  PollutantReading,
} from "../types/index.js";

// ---------------------------------------------------------------------------
// Breakpoint tables
// Each row: [C_lo, C_hi, I_lo, I_hi]
// Units: µg/m³ for all except CO which is mg/m³
// ---------------------------------------------------------------------------

type BreakpointRow = [number, number, number, number];

const BREAKPOINTS: Record<PollutantId, BreakpointRow[]> = {
  pm2_5: [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, Infinity, 401, 500],
  ],
  pm10: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [431, Infinity, 401, 500],
  ],
  no2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [401, Infinity, 401, 500],
  ],
  so2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1601, Infinity, 401, 500],
  ],
  o3: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 168, 101, 200],
    [169, 208, 201, 300],
    [209, 748, 301, 400],
    [749, Infinity, 401, 500],
  ],
  /** CO breakpoints use mg/m³. Open-Meteo returns µg/m³ — divide by 1000 first. */
  co: [
    [0, 1.0, 0, 50],
    [1.1, 2.0, 51, 100],
    [2.1, 10, 101, 200],
    [10.1, 17, 201, 300],
    [17.1, 34, 301, 400],
    [34.1, Infinity, 401, 500],
  ],
};

// ---------------------------------------------------------------------------
// AQI category boundaries
// ---------------------------------------------------------------------------

const CATEGORY_BOUNDARIES: Array<[number, Category]> = [
  [50, "Good"],
  [100, "Satisfactory"],
  [200, "Moderately Polluted"],
  [300, "Poor"],
  [400, "Very Poor"],
  [500, "Severe"],
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the CPCB sub-index for a single pollutant concentration.
 * Returns a value in [0, 500].
 *
 * @param pollutant - The pollutant identifier
 * @param concentration - Concentration in the CPCB-specified unit for that
 *   pollutant (µg/m³ for all except CO which must be in mg/m³)
 */
export function computeSubIndex(
  pollutant: PollutantId,
  concentration: number
): number {
  if (concentration < 0) {
    throw new RangeError(
      `Concentration for ${pollutant} must be non-negative, got ${concentration}`
    );
  }

  const rows = BREAKPOINTS[pollutant];

  for (const [cLo, cHi, iLo, iHi] of rows) {
    if (concentration >= cLo && concentration <= cHi) {
      // Handle the Infinity upper bound (Severe category): cap sub-index at 500
      if (cHi === Infinity) return 500;

      // Linear interpolation
      const subIndex = ((iHi - iLo) / (cHi - cLo)) * (concentration - cLo) + iLo;
      return Math.min(500, Math.round(subIndex));
    }
  }

  // Should never reach here for valid non-negative input, but be safe
  return 500;
}

/**
 * Derive the CPCB AQI category label for a given AQI value.
 */
export function getCategory(aqi: number): Category {
  for (const [upperBound, category] of CATEGORY_BOUNDARIES) {
    if (aqi <= upperBound) return category;
  }
  return "Severe";
}

export interface RawConcentration {
  pollutant: PollutantId;
  /** Concentration in CPCB units (CO must already be in mg/m³) */
  concentration: number | null;
}

export interface AqiResult {
  aqi: number;
  category: Category;
  prominentPollutant: PollutantId;
  readings: PollutantReading[];
}

export class InsufficientDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

/**
 * Compute the overall CPCB AQI from an array of raw pollutant concentrations.
 *
 * Throws InsufficientDataError if the minimum data rule is not satisfied:
 *   - At least 3 pollutants must have non-null concentrations
 *   - At least one must be PM₂.₅ or PM₁₀
 */
export function computeAqi(rawConcentrations: RawConcentration[]): AqiResult {
  // Filter to valid (non-null, non-negative) concentrations
  const valid = rawConcentrations.filter(
    (r): r is { pollutant: PollutantId; concentration: number } =>
      r.concentration !== null && r.concentration >= 0
  );

  // Minimum data rule
  const hasPM = valid.some(
    (r) => r.pollutant === "pm2_5" || r.pollutant === "pm10"
  );

  if (valid.length < 3 || !hasPM) {
    throw new InsufficientDataError(
      `CPCB minimum data rule not met: ${valid.length} valid pollutant(s) available` +
        (hasPM ? "" : ", and neither PM₂.₅ nor PM₁₀ is available") +
        ". Need at least 3 pollutants including one PM."
    );
  }

  // Compute sub-index for each valid pollutant
  const readings: PollutantReading[] = valid.map(({ pollutant, concentration }) => {
    const subIndex = computeSubIndex(pollutant, concentration);
    const category = getCategory(subIndex);
    const unit: "µg/m³" | "mg/m³" = pollutant === "co" ? "mg/m³" : "µg/m³";
    return { pollutant, concentration, unit, subIndex, category };
  });

  // Final AQI = maximum sub-index
  const prominent = readings.reduce((max, r) =>
    r.subIndex > max.subIndex ? r : max
  );

  return {
    aqi: prominent.subIndex,
    category: prominent.category,
    prominentPollutant: prominent.pollutant,
    readings,
  };
}
