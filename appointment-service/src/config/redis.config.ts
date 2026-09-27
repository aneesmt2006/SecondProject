import { config } from "./env.config.js";
import { createClient } from "redis";
import logger from "../utils/logger.js";

export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

while (true) {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully (appointment-service)');
    break;
  } catch (error) {
    logger.error('Failed to connect to Redis, retrying in 5 seconds...', error);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
