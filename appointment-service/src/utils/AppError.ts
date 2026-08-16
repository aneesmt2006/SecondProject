/**
 * Standardized application error class to distinguish between
 * expected operational errors (e.g. 400 Bad Request, 404 Not Found)
 * and unexpected programmer errors (500 Internal Server Error).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace without including the constructor call in it
    Error.captureStackTrace(this, this.constructor);
  }
}
