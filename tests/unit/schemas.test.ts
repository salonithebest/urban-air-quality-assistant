import { describe, it, expect, vi } from "vitest";
import {
  AirQualityQuerySchema,
  FamilyMemberSchema,
  FamilyProfileSchema,
  RoutineChoiceSchema,
  AdviceRequestSchema,
  DATA_NOTE,
} from "../../server/src/schemas/index.js";
import { validateQuery, validateBody } from "../../server/src/middleware/validate.js";

describe("AirQualityQuerySchema", () => {
  it("accepts valid Indian coordinates", () => {
    const res = AirQualityQuerySchema.safeParse({
      lat: "28.6139",
      lon: "77.2090",
      city: "Delhi",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.lat).toBe(28.6139);
      expect(res.data.lon).toBe(77.209);
    }
  });

  it("rejects latitude outside India (< 6 or > 36)", () => {
    expect(AirQualityQuerySchema.safeParse({ lat: 5.9, lon: 77 }).success).toBe(false);
    expect(AirQualityQuerySchema.safeParse({ lat: 36.1, lon: 77 }).success).toBe(false);
  });

  it("rejects longitude outside India (< 68 or > 97)", () => {
    expect(AirQualityQuerySchema.safeParse({ lat: 20, lon: 67.9 }).success).toBe(false);
    expect(AirQualityQuerySchema.safeParse({ lat: 20, lon: 97.5 }).success).toBe(false);
  });
});

describe("FamilyMemberSchema & Security Sanitization", () => {
  it("sanitizes dangerous characters (<, >, \", ', newlines) from member name", () => {
    const res = FamilyMemberSchema.safeParse({
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      name: '<script>alert("hacked")</script>\nGrandpa',
      role: "senior",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("scriptalert(hacked)/scriptGrandpa");
      expect(res.data.name).not.toContain("<");
      expect(res.data.name).not.toContain(">");
      expect(res.data.name).not.toContain('"');
      expect(res.data.name).not.toContain("\n");
    }
  });

  it("rejects invalid role", () => {
    const res = FamilyMemberSchema.safeParse({
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      name: "Rohan",
      role: "alien",
    });
    expect(res.success).toBe(false);
  });
});

describe("FamilyProfileSchema", () => {
  it("rejects empty family", () => {
    expect(FamilyProfileSchema.safeParse({ members: [] }).success).toBe(false);
  });

  it("rejects more than 10 members", () => {
    const members = Array.from({ length: 11 }, (_, i) => ({
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      name: `Person ${i}`,
      role: "adult",
    }));
    expect(FamilyProfileSchema.safeParse({ members }).success).toBe(false);
  });
});

describe("RoutineChoiceSchema", () => {
  it("accepts valid choice and limits max duration", () => {
    expect(
      RoutineChoiceSchema.safeParse({
        activityType: "metro",
        durationMinutes: 45,
        distanceKm: 15,
      }).success
    ).toBe(true);

    expect(
      RoutineChoiceSchema.safeParse({
        activityType: "metro",
        durationMinutes: 300,
      }).success
    ).toBe(false);
  });
});

describe("AdviceRequestSchema", () => {
  it("validates full structured advice payload with matching DATA_NOTE", () => {
    const mockRequest = {
      aqiSnapshot: {
        city: "Delhi",
        lat: 28.6139,
        lon: 77.209,
        aqi: 180,
        category: "Moderately Polluted",
        prominentPollutant: "pm2_5",
        pollutants: [
          {
            pollutant: "pm2_5",
            concentration: 85,
            unit: "µg/m³",
            subIndex: 180,
            category: "Moderately Polluted",
          },
          {
            pollutant: "pm10",
            concentration: 120,
            unit: "µg/m³",
            subIndex: 113,
            category: "Moderately Polluted",
          },
          {
            pollutant: "no2",
            concentration: 45,
            unit: "µg/m³",
            subIndex: 56,
            category: "Satisfactory",
          },
        ],
        timestamp: new Date().toISOString(),
        dataNote: DATA_NOTE,
      },
      familyProfile: {
        members: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Saloni",
            role: "adult",
          },
        ],
      },
      routineChoices: [
        {
          activityType: "metro",
          durationMinutes: 30,
          distanceKm: 10,
        },
      ],
      indoorContext: {
        hasAirPurifier: true,
        hasPlants: true,
        ventilationType: "natural",
      },
    };

    const res = AdviceRequestSchema.safeParse(mockRequest);
    expect(res.success).toBe(true);
  });
});

describe("validate middleware & res.locals shape assertion", () => {
  it("populates and types res.locals.validatedQuery upon successful validation", () => {
    const req = { query: { lat: "28.6139", lon: "77.2090", city: "Delhi" } } as any;
    const res = { locals: {} } as any;
    const next = vi.fn();

    validateQuery(AirQualityQuerySchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.validatedQuery).toBeDefined();
    expect(res.locals.validatedQuery).toMatchObject({
      lat: 28.6139,
      lon: 77.209,
      city: "Delhi",
    });
  });

  it("populates and types res.locals.validatedBody upon successful validation", () => {
    const validBody = {
      aqiSnapshot: {
        city: "Mumbai",
        lat: 19.076,
        lon: 72.8777,
        aqi: 120,
        category: "Moderately Polluted",
        prominentPollutant: "pm10",
        pollutants: [
          { pollutant: "pm2_5", concentration: 40, unit: "µg/m³", subIndex: 67, category: "Satisfactory" },
          { pollutant: "pm10", concentration: 110, unit: "µg/m³", subIndex: 120, category: "Moderately Polluted" },
          { pollutant: "no2", concentration: 30, unit: "µg/m³", subIndex: 38, category: "Good" },
        ],
        timestamp: new Date().toISOString(),
        dataNote: DATA_NOTE,
      },
      familyProfile: {
        members: [{ id: "123e4567-e89b-12d3-a456-426614174000", name: "Aarav", role: "child" }],
      },
      routineChoices: [{ activityType: "metro", durationMinutes: 30, distanceKm: 12 }],
      indoorContext: { hasAirPurifier: true, hasPlants: true, ventilationType: "natural" },
    };

    const req = { body: validBody } as any;
    const res = { locals: {} } as any;
    const next = vi.fn();

    validateBody(AdviceRequestSchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.validatedBody).toBeDefined();
    expect(res.locals.validatedBody.aqiSnapshot.city).toBe("Mumbai");
    expect(res.locals.validatedBody.familyProfile.members).toHaveLength(1);
  });
});
