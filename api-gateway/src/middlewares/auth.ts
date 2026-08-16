import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/env.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import { redisClient } from '../config/redis.config.js';

// Endpoints that bypass JWT validation
const PUBLIC_PREFIXES: ReadonlySet<string> = new Set([
  '/api/v1/account/auth/register',
  '/api/v1/account/auth/login',
  '/api/v1/account/auth/refresh',
  '/api/v1/account/auth/google',
  '/api/v1/account/auth/verify-otp',
  '/api/v1/account/auth/dr/register',
  '/api/v1/account/auth/dr/verify-otp',
  '/api/v1/account/auth/dr/login',
  '/api/v1/account/auth/admin/login',
]);

// Anchored prefix match — prevents auth bypass via embedded path segments
function isPublicEndpoint(url: string): boolean {
  const urlWithoutQuery = url.split('?')[0]!;
  for (const prefix of PUBLIC_PREFIXES) {
    if (
      urlWithoutQuery === prefix ||
      urlWithoutQuery.startsWith(prefix + '/') ||
      url.startsWith(prefix + '?')
    ) {
      return true;
    }
  }
  return false;
}

export const withAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (isPublicEndpoint(req.originalUrl)) return next();

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized — missing or malformed Authorization header', {
        path: req.originalUrl,
        requestId: req.headers['x-request-id'],
      });
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const decoded = (jwt.verify(token, config.jwtSecret as string) as unknown) as {
      id: string;
      role: string;
    };

    // Pass identity to downstream services via internal headers
    req.headers['x-token-id'] = decoded.id;
    req.headers['x-token-role'] = decoded.role;

    // Fail open on Redis outage — blacklist unavailable is better than locking all users out
    try {
      const blocked = await redisClient.get(`id:${decoded.id}`);
      if (blocked) {
        logger.warn(`Blocked user attempted access: ${decoded.id}`, {
          requestId: req.headers['x-request-id'],
        });
        res.status(403).json({ status: 'error', message: 'Your account has been suspended.' });
        return;
      }
    } catch (redisErr) {
      logger.error('Redis blacklist check failed — failing open', {
        error: (redisErr as Error).message,
        userId: decoded.id,
        requestId: req.headers['x-request-id'],
      });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      logger.warn(`Invalid or expired token: ${(error as Error).message}`, {
        path: req.originalUrl,
        requestId: req.headers['x-request-id'],
      });
      res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
      return;
    }
    next(error);
  }
};
