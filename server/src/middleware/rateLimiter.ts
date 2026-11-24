/**
 * @file rateLimiter.ts
 * @description In-memory IP-based rate limiting configurations.
 * Prevents denial-of-service spikes and enforces Google Gemini API quota preservation.
 */

import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

/**
 * Factory helper to generate rate limiter middleware instances with consistent configuration.
 * Eliminates duplication across rate limiting rules.
 */
export function createLimiter(
  limit: number,
  windowMs: number,
  message: string
): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    max: process.env.NODE_ENV === "test" ? 1000 : limit,
    message: {
      error: message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Rate limiter for atmospheric data endpoints.
 * Limit: 60 requests per 15 minutes per IP address.
 */
export const aqiRateLimiter = createLimiter(
  60,
  15 * 60 * 1000,
  "Too many requests for air quality data (limit: 60 requests per 15 minutes). Please try again later."
);

/**
 * Strict rate limiter for personalized advice synthesis.
 * Limit: 5 requests per 1 minute per IP address.
 */
export const adviceRateLimiter = createLimiter(
  5,
  1 * 60 * 1000,
  "Advice request limit reached (limit: 5 requests per 1 minute). Please wait a moment."
);
