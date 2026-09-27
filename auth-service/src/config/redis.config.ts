import { config } from "./env.config.js";
import { createClient } from "redis";
import logger from "../utils/logger.js";


if (!config.redisUrl) {
  throw new Error("Redis env is missing...");
}

export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

while (true) {
  try {
    await redisClient.connect();
    logger.info("Redis connected successfully (auth-service)");
    break;
  } catch (error) {
    logger.error("Failed to connect to Redis, retrying in 5 seconds...", error);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
