import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { config } from './config/env.config';
import 'reflect-metadata';
import * as amqplib from 'amqplib';

async function bootstrap() {
  await setupRabbitMqBinding();
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
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  await app.listen(3015);

  console.log('Websocket HTTP server running ');
  console.log('Notification service running for events');
}

async function setupRabbitMqBinding() {
  try {
    const connection = await amqplib.connect(config.rabbitmqUrl!);
    const channel = await connection.createChannel();

    const queue = 'notifications.payments.refunded';
    const exchange = 'payment.events';
    const routingKey = 'payment.refunded';

    await channel.assertQueue(queue, { durable: true });
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log('Payment Refund Queue Bound Successfully 🐰');
    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('Error binding RabbitMQ:', err);
  }
}

bootstrap();
