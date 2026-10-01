import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { consumeAppointmentEvents } from "./consumers/refund.consumer.js";
import logger from "./utils/logger.js";
import type { Server } from "http";

const PORT = config.port;
let server: Server;

const start = async () => {
  try {
    await connectRabbitMQ();
    await consumeAppointmentEvents();

    server = app.listen(PORT, () => {
      logger.info(`Payment SERVICE running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start payment service", error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();

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
