import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { config } from "../config/env.config.js";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Extract Request ID if available
  const requestId = req.headers['x-request-id'] as string | undefined;

  // Operational Errors (e.g., 400, 401, 404)
  if (error instanceof AppError && error.isOperational) {
    logger.warn(`Operational Error: ${error.message}`, {
      requestId,
      path: req.originalUrl,
      statusCode: error.statusCode,
    });
    
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  // Programmer Errors / Unhandled Exceptions (500)
  logger.error(`Unhandled Exception: ${error.message}`, {
    requestId,
    path: req.originalUrl,
    stack: error.stack,
  });

  const message = config.deploy === 'development' 
    ? error.message 
    : 'Internal Server Error';

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message,
    ...(config.deploy === 'development' && { stack: error.stack })
  });
};