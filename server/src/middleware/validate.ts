/**
 * @file validate.ts
 * @description Type-safe request validation middleware.
 * Stores validated payload in res.locals to maintain immutable request objects and eliminate side-effect mutations.
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Type declaration augmenting Express.Locals to strictly define validated payloads and user identity.
 */
declare global {
  namespace Express {
    interface Locals {
      validatedQuery?: unknown;
      validatedBody?: unknown;
      user?: { id: string; role: string };
    }
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    // Clean practice: store validated data on res.locals instead of mutating req.query
    res.locals.validatedQuery = result.data;
    next();
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    // Clean practice: store validated data on res.locals instead of mutating req.body
    res.locals.validatedBody = result.data;
    next();
  };
}
