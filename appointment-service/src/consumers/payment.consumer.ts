import {
  getChannel,
  PAYMENT_QUEUE,
  RETRY_EXCHANGE,
  RETRY_ROUTING_KEY,
  APPOINTMENT_EXCHANGE,
} from '../config/rabbitmq.config.js';
import { container } from '../config/inversify.config.js';
import { TYPES } from '../types/type.js';
import type { IAppointmentService } from '../services/interfaces/IAppointmentService.js';
import logger from '../utils/logger.js';

const MAX_RETRIES = 3;

export const startPaymentConsumer = async (): Promise<void> => {
  const channel = getChannel();

  logger.info('Payment consumer started', { queue: PAYMENT_QUEUE });

  channel.consume(PAYMENT_QUEUE, async (message) => {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString());
      const { eventType, appointmentId } = event;

      if (eventType !== 'PAYMENT_SUCCESS') {
        channel.ack(message);
        return;
      }

      logger.info('Processing payment success', { appointmentId });

      const appointmentService = container.get<IAppointmentService>(TYPES.AppointmentService);
      const { appointment } = await appointmentService.update(appointmentId, 'SUCCESS');

      logger.info('Appointment updated to SUCCESS', { appointmentId });

      // Notify other services (notification-service picks this up)
      channel.publish(
        APPOINTMENT_EXCHANGE,
        'appointment.confirmed',
        Buffer.from(JSON.stringify({
          pattern: 'appointment.confirmed',
          data: {
            appointmentId: appointment.appointmentId,
            appointmentTime: appointment.appointmentTime,
            doctorId: appointment.doctorId,
            userId: appointment.userId,
            appointmentDate: appointment.appointmentDate,
          },
        })),
      );

      channel.ack(message);
    } catch (error: any) {
      logger.error('Error processing payment event', { error: error.message });

      const headers = message.properties.headers || {};
      const retryCount = (headers['x-retry-count'] || 0) as number;

      if (retryCount < MAX_RETRIES) {
        // Send to retry queue → waits 10s → re-enters the main queue automatically
        logger.warn(`Retrying payment event`, { attempt: retryCount + 1, maxRetries: MAX_RETRIES });

        channel.publish(RETRY_EXCHANGE, RETRY_ROUTING_KEY, message.content, {
          headers: { ...headers, 'x-retry-count': retryCount + 1 },
          persistent: true,
        });
        channel.ack(message);
      } else {
        // All retries exhausted → nack without requeue → DLQ picks it up
        logger.error('Max retries exhausted, sending to DLQ', { retryCount });
        channel.nack(message, false, false);
      }
    }
  });
};
