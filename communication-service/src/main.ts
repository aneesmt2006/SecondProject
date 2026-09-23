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
  await app.listen(PORT);
  logger.log(`Communication Service running on port ${PORT}`);
}
bootstrap();
