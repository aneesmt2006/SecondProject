import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config/env.config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableShutdownHooks();

  const PORT = config.port ?? 3035;

  // Add Prometheus metrics endpoint
  const client = await import('prom-client');
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });
  app.use(
    '/metrics',
    async (req: import('express').Request, res: import('express').Response) => {
      res.setHeader('Content-Type', register.contentType);
      res.send(await register.metrics());
    },
  );

  await app.listen(PORT);
  logger.log(`Communication Service running on port ${PORT}`);
}
bootstrap().catch((err: unknown) => {
  console.error(err);
});
