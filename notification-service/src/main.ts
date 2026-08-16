import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { config } from './config/env.config';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [config.rabbitmqUrl!], //replac manual amqp.connect , channel.consume
      queue: 'notifications.appoinments.confirmed',
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [config.rabbitmqUrl!], //replac manual amqp.connect , channel.consume
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
      urls: [config.rabbitmqUrl!], //replac manual amqp.connect , channel.consume
      queue: 'notifications.triggering.abnormality',
      exchange: 'tracking.events',
      routingKey: 'tracking.abnormality',
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  await app.listen(3015);

  console.log('Websocket HTTP server running ');
  console.log('Notification service running for events');
}

bootstrap();
