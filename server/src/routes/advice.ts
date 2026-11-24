/**
 * @file advice.ts
 * @description API route handler for family health action plan synthesis.
 */

import { Router } from "express";
import { AdviceRequestSchema, type AdviceRequest } from "../schemas/index.js";
import { validateBody } from "../middleware/validate.js";
import { adviceRateLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/auth.js";
import { estimateCo2 } from "../services/co2Engine.js";
import { generateAdviceWording } from "../services/geminiService.js";

const router = Router();
export const adviceRouter = router;

// In-memory cache for CO2 estimations to reduce latency
const co2Cache = new Map<string, ReturnType<typeof estimateCo2>>();
function getCachedCo2(routineChoices: AdviceRequest["routineChoices"]) {
  const key = JSON.stringify(routineChoices);
  const cached = co2Cache.get(key);
  if (cached) return cached;
  const computed = estimateCo2(routineChoices);
  if (co2Cache.size > 200) co2Cache.clear();
  co2Cache.set(key, computed);
  return computed;
}

router.post(
  "/advice",
  adviceRateLimiter,
  authenticate,
  validateBody(AdviceRequestSchema),
  async (req, res, next): Promise<void> => {
    try {
      // Clean access from validated body on res.locals without mutating req.body
      const adviceRequest = (res.locals.validatedBody ?? req.body) as AdviceRequest;

      // 1. Calculate CO2 savings deterministically with in-memory caching
      const co2Estimate = getCachedCo2(adviceRequest.routineChoices);

      // 2. Call Gemini for language phrasing (passing the pre-computed CO2 & AQI)
      const advice = await generateAdviceWording(adviceRequest, co2Estimate);

      res.json(advice);
      return;
    } catch (err) {
      next(err);
      return;
    }
  }
);
