/**
 * @file rateLimiter.ts
 * @description In-memory IP-based rate limiting configurations.
 * Prevents denial-of-service spikes and enforces Google Gemini API quota preservation.
 */

import rateLimit from "express-rate-limit";

/**
 * Rate limiter for atmospheric data endpoints.
 * Limit: 60 requests per 15 minutes per IP address.
 */
export const aqiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    error: "Too many requests for air quality data (limit: 60 requests per 15 minutes). Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for personalized advice synthesis.
 * Limit: 5 requests per 1 minute per IP address.
 */
export const adviceRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error: "Advice request limit reached (limit: 5 requests per 1 minute). Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
