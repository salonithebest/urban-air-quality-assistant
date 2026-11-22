import { describe, it, expect } from "vitest";
import { estimateCo2 } from "../../server/src/services/co2Engine.js";
import type { RoutineChoice } from "../../server/src/schemas/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function choice(
  activityType: RoutineChoice["activityType"],
  distanceKm: number,
  durationMinutes = 30
): RoutineChoice {
  return { activityType, distanceKm, durationMinutes };
}

// ---------------------------------------------------------------------------
// Emission factor correctness per mode
// ---------------------------------------------------------------------------

describe("estimateCo2 – per-mode emission factors", () => {
  it("car baseline equals optimised (no savings when commuting by car)", () => {
    const result = estimateCo2([choice("car", 10)]);
    expect(result.savedKgPerDay).toBe(0);
    // baseline = 10 * 0.14 = 1.4
    expect(result.baselineKgPerDay).toBeCloseTo(1.4, 2);
    expect(result.optimisedKgPerDay).toBeCloseTo(1.4, 2);
  });

  it("metro produces lower emissions than car baseline", () => {
    const result = estimateCo2([choice("metro", 10)]);
    // baseline = 10 * 0.14 = 1.4, optimised = 10 * 0.032 = 0.32
    expect(result.baselineKgPerDay).toBeCloseTo(1.4, 2);
    expect(result.optimisedKgPerDay).toBeCloseTo(0.32, 2);
    expect(result.savedKgPerDay).toBeCloseTo(1.08, 2);
  });

  it("bike produces lower emissions than car baseline", () => {
    const result = estimateCo2([choice("bike", 10)]);
    // optimised = 10 * 0.04 = 0.4
    expect(result.optimisedKgPerDay).toBeCloseTo(0.4, 2);
    expect(result.savedKgPerDay).toBeGreaterThan(0);
  });

  it("auto-rickshaw produces lower emissions than car baseline", () => {
    const result = estimateCo2([choice("autorickshaw", 10)]);
    // optimised = 10 * 0.09 = 0.9
    expect(result.optimisedKgPerDay).toBeCloseTo(0.9, 2);
    expect(result.savedKgPerDay).toBeGreaterThan(0);
  });

  it("walk produces zero emissions (savedKgPerDay = baselineKgPerDay)", () => {
    const result = estimateCo2([choice("walk", 5)]);
    expect(result.optimisedKgPerDay).toBe(0);
    expect(result.savedKgPerDay).toBeCloseTo(result.baselineKgPerDay, 2);
  });

  it("wfh with zero distance produces zero emissions and zero baseline", () => {
    const result = estimateCo2([choice("wfh", 0, 0)]);
    expect(result.baselineKgPerDay).toBe(0);
    expect(result.optimisedKgPerDay).toBe(0);
    expect(result.savedKgPerDay).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Annual savings and tree-day equivalent
// ---------------------------------------------------------------------------

describe("estimateCo2 – annual and tree calculations", () => {
  it("savedKgPerYear = savedKgPerDay × 365", () => {
    const result = estimateCo2([choice("metro", 10)]);
    expect(result.savedKgPerYear).toBeCloseTo(result.savedKgPerDay * 365, 1);
  });

  it("equivalentTreeDays is positive when savings exist", () => {
    const result = estimateCo2([choice("walk", 5)]);
    expect(result.equivalentTreeDays).toBeGreaterThan(0);
  });

  it("equivalentTreeDays is 0 when there are no savings (car mode)", () => {
    const result = estimateCo2([choice("car", 10)]);
    expect(result.equivalentTreeDays).toBe(0);
  });

  it("tree-day formula: (savedKgPerYear / 21) * 365", () => {
    const result = estimateCo2([choice("walk", 10)]);
    const expected = (result.savedKgPerYear / 21) * 365;
    expect(result.equivalentTreeDays).toBeCloseTo(expected, 1);
  });
});

// ---------------------------------------------------------------------------
// Mixed modes and multiple choices
// ---------------------------------------------------------------------------

describe("estimateCo2 – multiple choices", () => {
  it("aggregates correctly across multiple modes", () => {
    const result = estimateCo2([
      choice("metro", 8),
      choice("walk", 2),
    ]);
    // baseline = (8 + 2) * 0.14 = 1.4
    // optimised = 8 * 0.032 + 2 * 0 = 0.256
    expect(result.baselineKgPerDay).toBeCloseTo(1.4, 2);
    expect(result.optimisedKgPerDay).toBeCloseTo(0.256, 2);
  });

  it("savings never go negative (all car = zero savings)", () => {
    const result = estimateCo2([choice("car", 20), choice("car", 10)]);
    expect(result.savedKgPerDay).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Distance estimation from duration (when distanceKm is not provided)
// ---------------------------------------------------------------------------

describe("estimateCo2 – distance estimation from duration", () => {
  it("estimates car distance when distanceKm is omitted", () => {
    // 30 min by car at 25 km/h = 12.5 km → no savings
    const result = estimateCo2([{ activityType: "car", durationMinutes: 30 }]);
    expect(result.baselineKgPerDay).toBeCloseTo(12.5 * 0.14, 2);
  });

  it("estimates walk distance when distanceKm is omitted", () => {
    // 60 min walk at 5 km/h = 5 km
    const result = estimateCo2([{ activityType: "walk", durationMinutes: 60 }]);
    expect(result.baselineKgPerDay).toBeCloseTo(5 * 0.14, 2);
    expect(result.optimisedKgPerDay).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Source label
// ---------------------------------------------------------------------------

describe("estimateCo2 – sourceLabel", () => {
  it("includes a non-empty source label", () => {
    const result = estimateCo2([choice("metro", 10)]);
    expect(result.sourceLabel.length).toBeGreaterThan(0);
  });

  it('sourceLabel starts with "Approx."', () => {
    const result = estimateCo2([choice("walk", 5)]);
    expect(result.sourceLabel).toMatch(/^Approx\./);
  });
});
