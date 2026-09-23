import { config } from "./env.config.js";
import { createClient } from "redis";
import logger from "../utils/logger.js";


if (!config.redisUrl) {
  throw new Error("Redis env is missing...");
}

export const redisClient = createClient({
  url: config.redisUrl,
});

await redisClient.connect();

logger.info("Redis connected successfully (auth-service)");

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});


