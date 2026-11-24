import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { airQualityRouter } from "./routes/airQuality.js";
import { adviceRouter } from "./routes/advice.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { aqiRateLimiter, adviceRateLimiter } from "./middleware/rateLimiter.js";

export const app = express();

// Security: Disable fingerprinting & apply global security middleware
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));

// Route-level rate limiting middleware attachment
app.use("/api/air-quality", aqiRateLimiter);
app.use("/api/advice", adviceRateLimiter);

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api", airQualityRouter);
app.use("/api", adviceRouter);

// Central error handler
app.use(errorHandler);

// Start listening if executed directly
if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}
