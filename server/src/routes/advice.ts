import { Router } from "express";
import { AdviceRequestSchema, type AdviceRequest } from "../schemas/index.js";
import { validateBody } from "../middleware/validate.js";
import { adviceRateLimiter } from "../middleware/rateLimiter.js";
import { estimateCo2 } from "../services/co2Engine.js";
import { generateAdviceWording } from "../services/geminiService.js";

export const adviceRouter = Router();

adviceRouter.post(
  "/advice",
  adviceRateLimiter,
  validateBody(AdviceRequestSchema),
  async (req, res, next): Promise<void> => {
    try {
      const adviceRequest = req.body as AdviceRequest;

      // 1. Calculate CO2 savings deterministically (zero Gemini involvement)
      const co2Estimate = estimateCo2(adviceRequest.routineChoices);

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
