import "reflect-metadata"; // for inversify
import app from "./app.js";
import { config } from "./config/env.config.js";
import { metricsHandler } from "./utils/metrics.js";

import logger from "./utils/logger.js";
import mongoose from "mongoose";
import { redisClient } from "./config/redis.config.js";

const PORT = config.port || 3001;
app.get('/metrics', metricsHandler);

const server = app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT} [${config.nodeEnv}]`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(async () => {
    logger.info("HTTP server closed — draining existing connections");

    try {
      await mongoose.disconnect();
      logger.info("MongoDB connection closed");
    } catch (err) {
      logger.error("Error closing MongoDB", { error: (err as Error).message });
    }

    try {
      await redisClient.quit();
      logger.info("Redis connection closed");
    } catch (err) {
      logger.error("Error closing Redis", { error: (err as Error).message });
    }

    logger.info("Graceful shutdown complete");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 15_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Unhandled Rejection Safety Net ──────────────────────────────────────────
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled promise rejection", {
    reason: String(reason),
    promise: String(promise),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception — shutting down", {
    error: error.message,
    stack: error.stack,
  });
  shutdown("uncaughtException");
});
