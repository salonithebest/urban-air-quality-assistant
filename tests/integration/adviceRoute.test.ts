import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../server/src/index.js";
import { DATA_NOTE } from "../../server/src/schemas/index.js";
import * as geminiService from "../../server/src/services/geminiService.js";

describe("POST /api/advice", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validPayload = {
    aqiSnapshot: {
      city: "Delhi",
      lat: 28.6139,
      lon: 77.209,
      aqi: 220,
      category: "Poor",
      prominentPollutant: "pm2_5",
      pollutants: [
        {
          pollutant: "pm2_5",
          concentration: 105,
          unit: "µg/m³",
          subIndex: 220,
          category: "Poor",
        },
        {
          pollutant: "pm10",
          concentration: 180,
          unit: "µg/m³",
          subIndex: 153,
          category: "Moderately Polluted",
        },
        {
          pollutant: "no2",
          concentration: 40,
          unit: "µg/m³",
          subIndex: 50,
          category: "Good",
        },
      ],
      timestamp: "2026-11-22T10:00:00.000Z",
      dataNote: DATA_NOTE,
    },
    familyProfile: {
      members: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          name: "Aarav",
          role: "child",
        },
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
          name: "Dada ji",
          role: "senior",
        },
      ],
    },
    routineChoices: [
      {
        activityType: "metro",
        durationMinutes: 40,
        distanceKm: 15,
      },
    ],
    indoorContext: {
      hasAirPurifier: true,
      hasPlants: true,
      ventilationType: "natural",
    },
  };

  it("returns 200 with structured advice and pre-computed CO2 savings", async () => {
    const res = await request(app).post("/api/advice").send(validPayload);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.memberAdvice)).toBe(true);
    expect(res.body.memberAdvice.length).toBe(2);

    // Verify CO2 estimates are deterministically computed
    expect(res.body.co2Estimate).toBeDefined();
    // 15 km car baseline = 15 * 0.14 = 2.1
    // 15 km metro = 15 * 0.032 = 0.48
    // saved = 2.1 - 0.48 = 1.62
    expect(res.body.co2Estimate.savedKgPerDay).toBe(1.62);
    expect(res.body.co2Estimate.baselineKgPerDay).toBe(2.1);
    expect(res.body.co2Estimate.optimisedKgPerDay).toBe(0.48);

    // Verify recommendations exist
    expect(Array.isArray(res.body.routineSuggestions)).toBe(true);
    expect(Array.isArray(res.body.indoorTips)).toBe(true);
  });

  it("accepts exact default members from useFamilyProfile.ts", async () => {
    const clientPayloadWithDefaultMembers = {
      aqiSnapshot: validPayload.aqiSnapshot,
      familyProfile: {
        members: [
          { id: "d3b07384-d113-4944-9c87-8275e6fb0a11", name: "Aarav", role: "child" },
          { id: "e4c18495-e224-4a55-ad98-9386f70c1b22", name: "Saloni", role: "adult" },
          { id: "f5d295a6-f335-4b66-be09-a497081d2c33", name: "Dada ji", role: "senior" },
        ],
      },
      routineChoices: [
        { activityType: "metro", durationMinutes: 35, distanceKm: 14 },
      ],
      indoorContext: {
        hasAirPurifier: true,
        hasPlants: true,
        ventilationType: "natural",
      },
    };

    const res = await request(app).post("/api/advice").send(clientPayloadWithDefaultMembers);
    expect(res.status).toBe(200);
    expect(res.body.memberAdvice.length).toBe(3);
    expect(res.body.co2Estimate).toBeDefined();
  });

  it("returns 400 when a member id is not a valid UUID (e.g. legacy id '1')", async () => {
    const invalidPayload = {
      ...validPayload,
      familyProfile: {
        members: [
          { id: "1", name: "Aarav", role: "child" },
          { id: "2", name: "Saloni", role: "adult" },
        ],
      },
    };

    const res = await request(app).post("/api/advice").send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "familyProfile.members.0.id",
          message: "Invalid uuid",
        }),
      ])
    );
  });

  it("returns 400 when body does not match AdviceRequestSchema", async () => {
    const res = await request(app)
      .post("/api/advice")
      .send({ invalid: "payload" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("uses custom gemini service when mocked", async () => {
    const spy = vi
      .spyOn(geminiService, "generateAdviceWording")
      .mockResolvedValue({
        memberAdvice: [
          {
            memberId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            memberName: "Aarav",
            healthImpact: "Custom AI Health Impact",
            personalTips: ["Custom AI Tip 1"],
          },
        ],
        routineSuggestions: ["Custom Routine Advice"],
        indoorTips: ["Custom Indoor Advice"],
        co2Estimate: {
          baselineKgPerDay: 2.1,
          optimisedKgPerDay: 0.48,
          savedKgPerDay: 1.62,
          savedKgPerYear: 591.3,
          equivalentTreeDays: 10282,
          sourceLabel: "Approximate",
        },
        generatedAt: new Date().toISOString(),
      });

    const res = await request(app).post("/api/advice").send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.memberAdvice[0].healthImpact).toBe(
      "Custom AI Health Impact"
    );
    expect(spy).toHaveBeenCalled();
  });

  it("differentiates cache keys when member names, IDs, or routines differ (prevents cache collisions)", () => {
    const payload1 = { ...validPayload };
    const payload2 = {
      ...validPayload,
      familyProfile: {
        members: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa8",
            name: "Diya",
            role: "child",
          },
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa9",
            name: "Dada ji",
            role: "senior",
          },
        ],
      },
    };

    const key1 = geminiService.computeCacheKey(payload1 as any);
    const key2 = geminiService.computeCacheKey(payload2 as any);

    expect(key1).not.toBe(key2);
  });

  it("handles empty members list safely", async () => {
    const emptyProfilePayload = {
      ...validPayload,
      familyProfile: { members: [] },
    };
    const res = await request(app).post("/api/advice").send(emptyProfilePayload);
    expect(res.status).toBe(400); // Caught cleanly by schema validation
  });
});
