import { Router } from "express";
import {
  AirQualityQuerySchema,
  DATA_NOTE,
  type AqiResponse,
} from "../schemas/index.js";
import { validateQuery } from "../middleware/validate.js";
import { aqiRateLimiter } from "../middleware/rateLimiter.js";
import { fetchPollutantData } from "../services/openMeteo.js";
import { computeAqi } from "../services/aqiEngine.js";

export const airQualityRouter = Router();

// In-memory cache: key = `${lat},${lon}`, 15-minute TTL
interface CachedEntry {
  data: AqiResponse;
  expiresAt: number;
}
const cache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

airQualityRouter.get(
  "/air-quality",
  aqiRateLimiter,
  validateQuery(AirQualityQuerySchema),
  async (req, res, next) => {
    try {
      const { lat, lon, city } = req.query as unknown as {
        lat: number;
        lon: number;
        city?: string;
      };

      const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      const now = Date.now();
      const cached = cache.get(cacheKey);

      if (cached && cached.expiresAt > now) {
        return res.json({
          ...cached.data,
          city: city || cached.data.city,
        });
      }

      // Fetch fresh conditions from Open-Meteo
      const { rawConcentrations, timestamp } = await fetchPollutantData(lat, lon);

      // Compute CPCB AQI (pure function)
      const aqiResult = computeAqi(rawConcentrations);

      const response: AqiResponse = {
        city: city || "Selected Location",
        lat,
        lon,
        aqi: aqiResult.aqi,
        category: aqiResult.category,
        prominentPollutant: aqiResult.prominentPollutant,
        pollutants: aqiResult.readings,
        timestamp,
        dataNote: DATA_NOTE,
      };

      // Update cache
      cache.set(cacheKey, {
        data: response,
        expiresAt: now + CACHE_TTL_MS,
      });

      return res.json(response);
    } catch (err) {
      next(err);
    }
  }
);
