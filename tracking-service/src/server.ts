import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import logger from "./utils/logger.js";
import type { Server } from "http";

const PORT = config.port;
let server: Server;

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();
    server = app.listen(PORT, () => {
      logger.info(`Tracking-service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start tracking service", error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();

// eslint-disable-next-line @typescript-eslint/require-await
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — starting graceful shutdown`);

  if (server) {
    server.close(() => {
      logger.info("Graceful shutdown complete");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 15_000).unref();
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on("SIGTERM", () => shutdown("SIGTERM"));
// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled promise rejection", {
    reason: String(reason),
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    promise: String(promise),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception — shutting down", {
    error: error.message,
    stack: error.stack,
  });
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  shutdown("uncaughtException");
});
