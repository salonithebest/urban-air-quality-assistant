import rateLimit from "express-rate-limit";

// Rate limiter for AQI fetching (60 requests per 15 minutes per IP)
export const aqiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    error: "Too many requests for air quality data. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for advice (Gemini wrapper) - 5 requests per minute per IP
export const adviceRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error: "Advice request limit reached (max 5/min). Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
