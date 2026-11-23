import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { airQualityRouter } from "./routes/airQuality.js";
import { adviceRouter } from "./routes/advice.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// Security: Disable fingerprinting & configure defensive headers
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://air-quality-api.open-meteo.com",
          "https://generativelanguage.googleapis.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10kb" }));

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
