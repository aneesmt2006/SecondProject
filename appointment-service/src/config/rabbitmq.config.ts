import amqp, { type Channel, type ChannelModel } from 'amqplib';
import { config } from './env.config.js';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// RabbitMQ Topology for Appointment Service
//
// This service participates in two messaging flows:
//
// ┌─────────────────────────── INBOUND (Payment → Appointment) ────────────────────────────┐
// │                                                                                        │
// │  payment-service publishes "payment.success" to "payment.events" exchange               │
// │                                                                                        │
// │  ┌──────────────────┐     payment.success    ┌──────────────────────────────┐           │
// │  │ payment.events   │ ──────────────────────► │ appointment.payment.success  │           │
// │  │ (topic exchange) │                         │ (main queue)                 │           │
// │  └──────────────────┘                         └──────────┬───────────────────┘           │
// │                                                          │                              │
// │                                            ┌─────── on failure ───────┐                 │
// │                                            │                          │                 │
// │                                    retries < 3?                retries >= 3?             │
// │                                            │                          │                 │
// │                               ┌────────────▼──────────┐  ┌───────────▼──────────┐       │
// │                               │ payment.retry.exchange │  │ payment_dlx          │       │
// │                               │ (topic exchange)       │  │ (dead letter exchange)│      │
// │                               └────────────┬──────────┘  └───────────┬──────────┘       │
// │                                            │                         │                  │
// │                               ┌────────────▼──────────┐  ┌──────────▼───────────┐       │
// │                               │ appointment.payment.  │  │ payment_dlq          │       │
// │                               │ retry (TTL: 10s)      │  │ (dead letter queue)  │       │
// │                               │ → routes back to main │  │ → manual inspection  │       │
// │                               └───────────────────────┘  └──────────────────────┘       │
// └────────────────────────────────────────────────────────────────────────────────────────-─┘
//
// ┌─────────────────────────── OUTBOUND (Appointment → Others) ────────────────────────────┐
// │                                                                                        │
// │  This service publishes to "appointment.events" exchange for:                          │
// │    • appointment.confirmed  → notification-service picks this up                       │
// │    • appointment.cancelled  → payment-service handles refund                           │
// │                                                                                        │
// │  ┌──────────────────────┐  appointment.confirmed   ┌────────────────────────────────┐  │
// │  │ appointment.events   │ ────────────────────────► │ notifications.appointments.    │  │
// │  │ (topic exchange)     │                           │ confirmed (notification queue) │  │
// │  └──────────────────────┘                           └────────────────────────────────┘  │
// └────────────────────────────────────────────────────────────────────────────────────────-─┘
// ─────────────────────────────────────────────────────────────────────────────

// ─── Connection ──────────────────────────────────────────────────────────────

let connection: ChannelModel;
export let channel: Channel;

// ─── Topology Constants ─────────────────────────────────────────────────────

// Inbound: Payment Service → This Service
const PAYMENT_EXCHANGE        = 'payment.events';
const PAYMENT_QUEUE           = 'appointment.payment.success';
const PAYMENT_ROUTING_KEY     = 'payment.success';

// Retry: Failed messages get a second chance after a delay
const RETRY_EXCHANGE          = 'payment.retry.exchange';
const RETRY_QUEUE             = 'appointment.payment.retry';
const RETRY_ROUTING_KEY       = 'payment.retry';
const RETRY_TTL_MS            = 10_000; // 10 seconds before retry

// Dead Letter: Messages that exhausted all retries land here for manual inspection
const DLQ_EXCHANGE            = 'payment_dlx';
const DLQ_QUEUE               = 'payment_dlq';
const DLQ_ROUTING_KEY         = 'payment_routingKey';

// Outbound: This Service → Notification Service / Payment Service
const APPOINTMENT_EXCHANGE    = 'appointment.events';
const NOTIFICATION_QUEUE      = 'notifications.appointments.confirmed';

// ─── Exported constants (used by consumers / services) ──────────────────────

export {
  PAYMENT_EXCHANGE,
  PAYMENT_QUEUE,
  PAYMENT_ROUTING_KEY,
  RETRY_EXCHANGE,
  RETRY_ROUTING_KEY,
  APPOINTMENT_EXCHANGE,
};

// ─── Bootstrap Topology ─────────────────────────────────────────────────────

connection = await amqp.connect(config.rabbitmqUrl);
channel = await connection.createChannel();

// 1. Inbound: Main queue listens for payment.success events
await channel.assertExchange(PAYMENT_EXCHANGE, 'topic', { durable: true });
await channel.assertQueue(PAYMENT_QUEUE, {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': DLQ_EXCHANGE,
    'x-dead-letter-routing-key': DLQ_ROUTING_KEY,
  },
});
await channel.bindQueue(PAYMENT_QUEUE, PAYMENT_EXCHANGE, PAYMENT_ROUTING_KEY);

// 2. Retry: Failed messages wait here for RETRY_TTL_MS, then re-enter the main queue
await channel.assertExchange(RETRY_EXCHANGE, 'topic', { durable: true });
await channel.assertQueue(RETRY_QUEUE, {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': PAYMENT_EXCHANGE,
    'x-dead-letter-routing-key': PAYMENT_ROUTING_KEY,
    'x-message-ttl': RETRY_TTL_MS,
  },
});
await channel.bindQueue(RETRY_QUEUE, RETRY_EXCHANGE, RETRY_ROUTING_KEY);

// 3. Dead Letter: Messages that fail after all retries are stored here
await channel.assertExchange(DLQ_EXCHANGE, 'topic', { durable: true });
await channel.assertQueue(DLQ_QUEUE, { durable: true });
await channel.bindQueue(DLQ_QUEUE, DLQ_EXCHANGE, DLQ_ROUTING_KEY);

// 4. Outbound: This service publishes appointment events (confirmed / cancelled)
await channel.assertExchange(APPOINTMENT_EXCHANGE, 'topic', { durable: true });
await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
await channel.bindQueue(NOTIFICATION_QUEUE, APPOINTMENT_EXCHANGE, 'appointment.confirmed');

logger.info('RabbitMQ connected and topology ready (appointment-service)');

// ─── Error Listeners ────────────────────────────────────────────────────────

connection.on('error', (err) => {
  logger.error('RabbitMQ connection error', { error: err.message });
});
connection.on('close', () => {
  logger.error('RabbitMQ connection closed unexpectedly');
});

// ─── Helpers ────────────────────────────────────────────────────────────────

export const getChannel = (): Channel => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};
