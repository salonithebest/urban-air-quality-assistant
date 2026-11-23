/**
 * @file errorHandler.ts
 * @description Centralized Express error handler.
 * Sanitizes error outputs in production to prevent leaking internal stack traces or environment paths.
 */

import type { Request, Response, NextFunction } from "express";
import { InsufficientDataError } from "../services/aqiEngine.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Security: Only log verbose stack traces in development or test environments
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    console.error("Unhandled error:", err);
  } else {
    // Production: Log sanitized high-level diagnostic without internal stack paths
    console.error(`[Error] ${err.name || "InternalError"}: ${err.message || "An unexpected error occurred"}`);
  }

  if (err instanceof InsufficientDataError) {
    res.status(503).json({
      error: "Air quality data insufficient",
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
