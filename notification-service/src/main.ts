import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { config } from './config/env.config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    app.enableShutdownHooks();

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitmqUrl!],
        queue: 'notifications.appointments.confirmed',
        queueOptions: { durable: true },
        noAck: false,
      },
    });

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitmqUrl!],
        queue: 'notifications.payments.refunded',
        exchangeType: 'topic',
        exchange: 'payment.events',
        routingKey: 'payment.refunded',
        queueOptions: { durable: true },
        noAck: false,
      },
    });

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitmqUrl!],
        queue: 'notifications.triggering.abnormality',
        exchange: 'tracking.events',
        routingKey: 'tracking.abnormality',
        queueOptions: { durable: true },
        noAck: false,
      },
    });

    await app.startAllMicroservices();

    // Add Prometheus metrics endpoint
    const client = await import('prom-client');
    const register = new client.Registry();
    client.collectDefaultMetrics({ register });
    app.use(
      '/metrics',
      async (
        req: import('express').Request,
        res: import('express').Response,
      ) => {
        res.setHeader('Content-Type', register.contentType);
        res.send(await register.metrics());
      },
    );

    await app.listen(3015);

    logger.log('Websocket HTTP server running');
    logger.log('Notification service running for events');
  } catch (error) {
    logger.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

bootstrap().catch((err: unknown) => {
  console.error(err);
});
