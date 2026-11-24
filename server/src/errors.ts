/**
 * @file errors.ts
 * @description Centralized application error classes.
 * Decouples domain and HTTP error definitions to eliminate circular dependencies across services and middleware.
 */

export class InsufficientDataError extends Error {
  public readonly statusCode = 503;

  constructor(message: string) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access. Authentication token or API key required.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
