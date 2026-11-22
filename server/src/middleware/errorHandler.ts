import type { Request, Response, NextFunction } from "express";
import { InsufficientDataError } from "../services/aqiEngine.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled error:", err);

  if (err instanceof InsufficientDataError) {
    return res.status(503).json({
      error: "Air quality data insufficient",
      message: err.message,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
