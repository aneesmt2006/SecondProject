import { config } from "./env.config.js";
import { createClient } from "redis";
import logger from "../utils/logger.js";

export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

// Top-level await: Stops app startup until Redis connects.
// If Redis is down, the app crashes here (Fail-Fast pattern).
await redisClient.connect();
logger.info('Redis connected successfully (appointment-service)');
