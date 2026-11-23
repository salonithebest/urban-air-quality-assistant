import { describe, it, expect } from "vitest";
import { generateClientFallbackAdvice } from "../../client/src/utils/clientFallbackAdvice.js";
import { calculateDeterministicCo2 } from "../../client/src/utils/co2Calculator.js";
import type { AqiResponse, FamilyMember, RoutineChoice } from "../../client/src/types/index.js";

const mockAqiSnapshot: AqiResponse = {
  city: "Surat",
  lat: 21.1702,
  lon: 72.8311,
  aqi: 138,
  category: "Moderately Polluted",
  prominentPollutant: "pm10",
  pollutants: [
    { pollutant: "pm10", concentration: 125, unit: "µg/m³", subIndex: 138, category: "Moderately Polluted" },
    { pollutant: "pm2_5", concentration: 55, unit: "µg/m³", subIndex: 92, category: "Satisfactory" },
    { pollutant: "no2", concentration: 28, unit: "µg/m³", subIndex: 35, category: "Good" },
    { pollutant: "so2", concentration: 12, unit: "µg/m³", subIndex: 15, category: "Good" },
    { pollutant: "o3", concentration: 45, unit: "µg/m³", subIndex: 45, category: "Good" },
    { pollutant: "co", concentration: 0.8, unit: "mg/m³", subIndex: 40, category: "Good" },
  ],
  timestamp: new Date().toISOString(),
  dataNote: "Test model data",
};

describe("clientFallbackAdvice – deterministic generation", () => {
  it("generates structured advice for diverse household members safely", () => {
    const members: FamilyMember[] = [
      { id: "1", name: "Aarav", role: "child" },
      { id: "2", name: "Mahi", role: "asthmatic" },
      { id: "3", name: "Dadi", role: "senior" },
      { id: "4", name: "Saloni", role: "adult" },
    ];

    const routines: RoutineChoice[] = [
      { activityType: "metro", durationMinutes: 30, distanceKm: 12 },
      { activityType: "wfh", durationMinutes: 480, distanceKm: 0 },
    ];

    const advice = generateClientFallbackAdvice(mockAqiSnapshot, members, routines);

    expect(advice.memberAdvice).toHaveLength(4);
    expect(advice.memberAdvice[0]!.memberName).toBe("Aarav");
    expect(advice.memberAdvice[1]!.memberName).toBe("Mahi");

    // Asthmatic advice must advise consulting a doctor rather than prescribing timing
    const asthmaticTips = advice.memberAdvice[1]!.personalTips.join(" ");
    expect(asthmaticTips).toContain("Ask your doctor");
    expect(asthmaticTips).not.toContain("Pre-medicate 15 minutes");

    expect(advice.co2Estimate).toBeDefined();
    expect(advice.routineSuggestions.length).toBeGreaterThan(0);
    expect(advice.indoorTips.length).toBeGreaterThan(0);
  });

  it("handles empty members array and empty routines gracefully without crashing", () => {
    const advice = generateClientFallbackAdvice(mockAqiSnapshot, [], []);
    expect(advice.memberAdvice).toEqual([]);
    expect(advice.co2Estimate.savedKgPerDay).toBe(0);
  });
});

describe("co2Calculator – WFH distance locking and math", () => {
  it("locks WFH commute mode to 0 km and excludes from active travel emissions", () => {
    const routines: RoutineChoice[] = [
      { activityType: "wfh", durationMinutes: 480, distanceKm: 0 },
      { activityType: "metro", durationMinutes: 30, distanceKm: 10 },
    ];

    const metrics = calculateDeterministicCo2(routines);
    expect(metrics.totalKm).toBe(10);
    expect(metrics.wfhMinutes).toBe(480);
    expect(metrics.dailyCarbonCutKg).toBeGreaterThan(0);
  });
});
