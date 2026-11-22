import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../server/src/index.js";
import * as openMeteoService from "../../server/src/services/openMeteo.js";
import { InsufficientDataError } from "../../server/src/services/aqiEngine.js";

describe("GET /api/air-quality", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 and computed AQI response for valid coordinates", async () => {
    vi.spyOn(openMeteoService, "fetchPollutantData").mockResolvedValue({
      timestamp: "2026-11-22T10:00:00.000Z",
      rawConcentrations: [
        { pollutant: "pm2_5", concentration: 45 },
        { pollutant: "pm10", concentration: 80 },
        { pollutant: "no2", concentration: 50 },
        { pollutant: "so2", concentration: 20 },
        { pollutant: "o3", concentration: 30 },
        { pollutant: "co", concentration: 1.2 }, // in mg/m³
      ],
    });

    const res = await request(app).get(
      "/api/air-quality?lat=28.6139&lon=77.2090&city=Delhi"
    );

    expect(res.status).toBe(200);
    expect(res.body.city).toBe("Delhi");
    expect(res.body.aqi).toBe(80);
    expect(res.body.category).toBe("Satisfactory");
    expect(res.body.dataNote).toContain("not an official CPCB reading");
    expect(Array.isArray(res.body.pollutants)).toBe(true);
    expect(res.body.pollutants.length).toBe(6);
  });

  it("returns 400 when coordinates are outside India", async () => {
    const res = await request(app).get("/api/air-quality?lat=50.1109&lon=8.6821"); // Frankfurt
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 503 when Open-Meteo data does not satisfy minimum data rule", async () => {
    vi.spyOn(openMeteoService, "fetchPollutantData").mockImplementation(() => {
      throw new InsufficientDataError("Data rule not met");
    });

    const res = await request(app).get(
      "/api/air-quality?lat=21.1702&lon=72.8311&city=Surat"
    );
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("Air quality data insufficient");
  });
});
