import type { NextFunction, Request, Response } from 'express';
import logger from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const handleError = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Operational errors — return their specific status code
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message} — ${req.method} ${req.path}`);
    res.status(err.statusCode).json({ status: 'error', message: err.message });
    return;
  }

  // Unexpected errors — always 500, never leak internal details
  logger.error(`Unhandled error: ${err.message} — ${req.method} ${req.path}`, {
    stack: err.stack,
    requestId: req.headers['x-request-id'],
  });
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
};
