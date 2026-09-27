import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import logger from "./utils/logger.js";
import type { Server } from 'http';

const PORT = config.port || 3002;
let server: Server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      logger.info(`User Management Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start user-management service", error);
  }
};

startServer();

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — starting graceful shutdown`);

  if (server) {
    server.close(() => {
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 15_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: String(reason),
    promise: String(promise),
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception — shutting down', {
    error: error.message,
    stack: error.stack,
  });
  shutdown('uncaughtException');
});
