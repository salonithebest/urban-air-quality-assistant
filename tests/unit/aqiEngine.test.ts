import { describe, it, expect } from "vitest";
import {
  computeSubIndex,
  computeAqi,
  getCategory,
  InsufficientDataError,
} from "../../server/src/services/aqiEngine.js";

// ---------------------------------------------------------------------------
// computeSubIndex — boundary and interpolation tests
// ---------------------------------------------------------------------------

describe("computeSubIndex – PM₂.₅", () => {
  it("returns 0 at concentration 0 (lower bound of Good)", () => {
    expect(computeSubIndex("pm2_5", 0)).toBe(0);
  });

  it("returns 50 at concentration 30 (upper bound of Good)", () => {
    expect(computeSubIndex("pm2_5", 30)).toBe(50);
  });

  it("returns 51 at concentration 31 (lower bound of Satisfactory)", () => {
    expect(computeSubIndex("pm2_5", 31)).toBe(51);
  });

  it("returns 100 at concentration 60 (upper bound of Satisfactory)", () => {
    expect(computeSubIndex("pm2_5", 60)).toBe(100);
  });

  it("interpolates correctly at PM₂.₅ = 45 µg/m³ → ~75", () => {
    // (100-51)/(60-31) * (45-31) + 51 = 49/29 * 14 + 51 ≈ 74.65 → 75
    expect(computeSubIndex("pm2_5", 45)).toBe(75);
  });

  it("handles decimal concentrations across breakpoint boundaries without falling to 500", () => {
    // 30.2 rounds to 30 (Good upper bound → 50)
    expect(computeSubIndex("pm2_5", 30.2)).toBe(50);
    // 30.5 rounds to 31 (Satisfactory lower bound → 51)
    expect(computeSubIndex("pm2_5", 30.5)).toBe(51);
    // 60.4 rounds to 60 (Satisfactory upper bound → 100)
    expect(computeSubIndex("pm2_5", 60.4)).toBe(100);
    // 60.6 rounds to 61 (Moderately Polluted lower bound → 101)
    expect(computeSubIndex("pm2_5", 60.6)).toBe(101);
  });

  it("caps at 500 for concentration above Severe threshold", () => {
    expect(computeSubIndex("pm2_5", 999)).toBe(500);
  });

  it("throws RangeError for negative concentration", () => {
    expect(() => computeSubIndex("pm2_5", -1)).toThrow(RangeError);
  });
});

describe("computeSubIndex – PM₁₀", () => {
  it("returns 0 at concentration 0", () => {
    expect(computeSubIndex("pm10", 0)).toBe(0);
  });

  it("returns 50 at concentration 50 (upper bound of Good)", () => {
    expect(computeSubIndex("pm10", 50)).toBe(50);
  });

  it("returns 200 at concentration 250 (upper bound of Moderately Polluted)", () => {
    expect(computeSubIndex("pm10", 250)).toBe(200);
  });

  it("caps at 500 above Severe threshold (> 430)", () => {
    expect(computeSubIndex("pm10", 500)).toBe(500);
  });
});

describe("computeSubIndex – NO₂", () => {
  it("returns 0 at concentration 0", () => {
    expect(computeSubIndex("no2", 0)).toBe(0);
  });

  it("returns 50 at concentration 40 (upper bound of Good)", () => {
    expect(computeSubIndex("no2", 40)).toBe(50);
  });

  it("returns 300 at concentration 280 (upper bound of Poor)", () => {
    expect(computeSubIndex("no2", 280)).toBe(300);
  });
});

describe("computeSubIndex – SO₂", () => {
  it("returns 0 at concentration 0", () => {
    expect(computeSubIndex("so2", 0)).toBe(0);
  });

  it("returns 100 at concentration 80 (upper bound of Satisfactory)", () => {
    expect(computeSubIndex("so2", 80)).toBe(100);
  });
});

describe("computeSubIndex – O₃", () => {
  it("returns 0 at concentration 0", () => {
    expect(computeSubIndex("o3", 0)).toBe(0);
  });

  it("returns 200 at concentration 168 (upper bound of Moderately Polluted)", () => {
    expect(computeSubIndex("o3", 168)).toBe(200);
  });
});

describe("computeSubIndex – CO (mg/m³, NOT µg/m³)", () => {
  it("returns 0 at CO = 0 mg/m³", () => {
    expect(computeSubIndex("co", 0)).toBe(0);
  });

  it("returns 50 at CO = 1.0 mg/m³ (upper bound of Good)", () => {
    expect(computeSubIndex("co", 1.0)).toBe(50);
  });

  it("returns 51 at CO = 1.1 mg/m³ (lower bound of Satisfactory)", () => {
    expect(computeSubIndex("co", 1.1)).toBe(51);
  });

  it("returns 100 at CO = 2.0 mg/m³ (upper bound of Satisfactory)", () => {
    expect(computeSubIndex("co", 2.0)).toBe(100);
  });

  it("handles decimal CO readings at breakpoint boundaries", () => {
    // 1.04 rounds to 1.0 mg/m³ (Good upper bound → 50)
    expect(computeSubIndex("co", 1.04)).toBe(50);
    // 1.06 rounds to 1.1 mg/m³ (Satisfactory lower bound → 51)
    expect(computeSubIndex("co", 1.06)).toBe(51);
  });

  it("caps at 500 above Severe threshold", () => {
    expect(computeSubIndex("co", 50)).toBe(500);
  });

  it("CO unit conversion: 90000 µg/m³ ÷ 1000 = 90 mg/m³ → Severe (500)", () => {
    // This test documents the required conversion; the conversion itself
    // must happen in openMeteo.ts before calling computeSubIndex.
    const concentrationUgM3 = 90_000;
    const concentrationMgM3 = concentrationUgM3 / 1000; // 90 mg/m³
    expect(computeSubIndex("co", concentrationMgM3)).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// getCategory
// ---------------------------------------------------------------------------

describe("getCategory", () => {
  it("returns Good for AQI 0", () => expect(getCategory(0)).toBe("Good"));
  it("returns Good for AQI 50", () => expect(getCategory(50)).toBe("Good"));
  it("returns Satisfactory for AQI 51", () => expect(getCategory(51)).toBe("Satisfactory"));
  it("returns Satisfactory for AQI 100", () => expect(getCategory(100)).toBe("Satisfactory"));
  it("returns Moderately Polluted for AQI 101", () => expect(getCategory(101)).toBe("Moderately Polluted"));
  it("returns Poor for AQI 201", () => expect(getCategory(201)).toBe("Poor"));
  it("returns Very Poor for AQI 301", () => expect(getCategory(301)).toBe("Very Poor"));
  it("returns Severe for AQI 401", () => expect(getCategory(401)).toBe("Severe"));
  it("returns Severe for AQI 500", () => expect(getCategory(500)).toBe("Severe"));
});

// ---------------------------------------------------------------------------
// computeAqi — final AQI logic and minimum data rule
// ---------------------------------------------------------------------------

describe("computeAqi – happy path", () => {
  it("final AQI = max sub-index across pollutants", () => {
    const result = computeAqi([
      { pollutant: "pm2_5", concentration: 45 },  // subIndex = 75
      { pollutant: "pm10", concentration: 60 },   // (100-51)/(100-51)*(60-51) + 51 = 60
      { pollutant: "no2", concentration: 50 },    // (100-51)/(80-41)*(50-41) + 51 = 49/39*9 + 51 ≈ 62.3 → 62
    ]);
    expect(result.aqi).toBe(75);
    expect(result.prominentPollutant).toBe("pm2_5");
    expect(result.category).toBe("Satisfactory");
  });

  it("prominent pollutant is the one with the highest sub-index", () => {
    const result = computeAqi([
      { pollutant: "pm2_5", concentration: 10 },   // Good ~17
      { pollutant: "pm10", concentration: 300 },   // Poor ~226
      { pollutant: "no2", concentration: 100 },    // Mod ~153
    ]);
    expect(result.prominentPollutant).toBe("pm10");
  });

  it("includes a reading entry for each valid pollutant", () => {
    const result = computeAqi([
      { pollutant: "pm2_5", concentration: 20 },
      { pollutant: "pm10", concentration: 60 },
      { pollutant: "no2", concentration: 60 },
    ]);
    expect(result.readings).toHaveLength(3);
  });

  it("CO reading has unit mg/m³", () => {
    const result = computeAqi([
      { pollutant: "pm2_5", concentration: 20 },
      { pollutant: "pm10", concentration: 60 },
      { pollutant: "co", concentration: 1.5 },
    ]);
    const coReading = result.readings.find((r) => r.pollutant === "co");
    expect(coReading?.unit).toBe("mg/m³");
  });
});

describe("computeAqi – minimum data rule", () => {
  it("throws InsufficientDataError when fewer than 3 valid pollutants", () => {
    expect(() =>
      computeAqi([
        { pollutant: "pm2_5", concentration: 45 },
        { pollutant: "pm10", concentration: 80 },
      ])
    ).toThrow(InsufficientDataError);
  });

  it("throws InsufficientDataError when no PM pollutant is present", () => {
    expect(() =>
      computeAqi([
        { pollutant: "no2", concentration: 50 },
        { pollutant: "so2", concentration: 60 },
        { pollutant: "o3", concentration: 70 },
      ])
    ).toThrow(InsufficientDataError);
  });

  it("treats null concentrations as missing (not counted toward the 3 minimum)", () => {
    expect(() =>
      computeAqi([
        { pollutant: "pm2_5", concentration: 45 },
        { pollutant: "pm10", concentration: null },
        { pollutant: "no2", concentration: null },
      ])
    ).toThrow(InsufficientDataError);
  });

  it("throws InsufficientDataError when 3 entries contain duplicate pollutants (fewer than 3 unique)", () => {
    expect(() =>
      computeAqi([
        { pollutant: "pm2_5", concentration: 45 },
        { pollutant: "pm2_5", concentration: 50 },
        { pollutant: "no2", concentration: 40 },
      ])
    ).toThrow(InsufficientDataError);
  });

  it("succeeds with exactly 3 valid pollutants including one PM", () => {
    expect(() =>
      computeAqi([
        { pollutant: "pm2_5", concentration: 45 },
        { pollutant: "no2", concentration: 50 },
        { pollutant: "so2", concentration: 60 },
      ])
    ).not.toThrow();
  });
});
