import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.config.js';
import logger from '../config/logger.js';
import type { Request } from 'express';

function buildLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message: string;
}) {
  // Simple declarative configuration — works safely now because
  // redisClient is guaranteed to be connected by the top-level await
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: `rl:${options.keyPrefix}:`,
    }),
    keyGenerator: (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])
        ?? req.socket.remoteAddress
        ?? 'unknown';
      return ip;
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded — ${options.keyPrefix}`, {
        ip: req.ip,
        path: req.originalUrl,
        requestId: req.headers['x-request-id'],
      });
      res.status(429).json({
        status: 'error',
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
    skip: (req) => req.path === '/health' || req.path === '/metrics',
  });
}

// 200 req / 15 min — applied globally
export const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyPrefix: 'global',
  message: 'Too many requests. Please try again in 15 minutes.',
});

// 15 req / 15 min — brute-force protection on auth routes
export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again later.',
});

// 30 req / 15 min — financial / sensitive mutations
export const strictLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyPrefix: 'strict',
  message: 'Rate limit exceeded for this operation.',
});