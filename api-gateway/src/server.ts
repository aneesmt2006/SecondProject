import app from './app.js';
import { config } from './config/env.js';
import logger from './config/logger.js';
import { redisClient } from './config/redis.config.js';
import type { Server } from 'http';

const server: Server = app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port} [${config.deploy}]`);
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — starting graceful shutdown`);

  // Stop accepting new connections
  server.close(async () => {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (err) {
      logger.error('Error closing Redis during shutdown', { error: (err as Error).message });
    }
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force exit if shutdown hangs beyond 15s
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
