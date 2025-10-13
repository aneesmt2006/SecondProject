import { config } from "./env.config.js";
import { createClient } from "redis";

if (!config.redisUrl) {
  throw new Error("Redis env is missing...");
}

export const redisClient = createClient({
  url: config.redisUrl,
});
