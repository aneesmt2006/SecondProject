import logger from "../utils/logger.js";

import { container } from "../config/inversify.config.js";
import { getChannel } from "../config/rabbitmq.config.js";
import type { IPaymentService } from "../services/interfaces/IPaymentService.js";
import { TYPES } from "../types/type.js";

export const consumeAppointmentEvents = async () => {
  const channel = getChannel();

  const EXCHANGE = 'appointment.events';
  const QUEUE = 'appointment.payment.refund';
  const ROUTING_KEY = 'appointment.cancelled';
  

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  await channel.assertQueue(QUEUE, { durable: true });

  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  logger.info("📥 Listening for Appointment CANCELLED events...");

  channel.consume(QUEUE, async (msg) => {
    if(msg){
      const event = JSON.parse(msg.content.toString());
      logger.info("Received cancel event:", event);
        
      try {
        const {status,eventType,appointmentId,appointmentDate,appointmentTime} = event

      if(eventType==='PAYMENT_REFUNDED'){
        logger.info("Nan listened cheythittund---->😇😇")
        const paymentService =  container.get<IPaymentService>(TYPES.PaymentService);
        await paymentService.refund(appointmentId,status,appointmentDate,appointmentTime)
      }
      

      channel.ack(msg);
      } catch (error) {
        logger.info("Refund consumer error ",error)
        channel.nack(msg,false,false)
      }
    }
  });
};
