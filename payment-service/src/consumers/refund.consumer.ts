
import { container } from "../config/inversify.config.js";
import { getChannel } from "../config/rabbitmq.config.js";
import type { IPaymentService } from "../services/interfaces/IPaymentService.js";
import { TYPES } from "../types/type.js";

export const consumeAppointmentEvents = async () => {
  const channel = getChannel();

  const EXCHANGE = 'appoinment.events';
  const QUEUE = 'appoinment.payment.refund';
  const ROUTING_KEY = 'appoinment.cancelled';
  

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  await channel.assertQueue(QUEUE, { durable: true });

  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log("📥 Listening for Appointment CANCELLED events...");

  channel.consume(QUEUE, async (msg) => {
    if(msg){
      const event = JSON.parse(msg.content.toString());
      console.log("Received cancel event:", event);
        
      try {
        const {status,eventType,appoinmentId,appoinmentDate,appoinmentTime} = event

      if(eventType==='PAYMENT_REFUNDED'){
        console.log("Nan listened cheythittund---->😇😇")
        const paymentService =  container.get<IPaymentService>(TYPES.PaymentService);
        await paymentService.refund(appoinmentId,status,appoinmentDate,appoinmentTime)
      }
      

      channel.ack(msg);
      } catch (error) {
        console.log("Refund consumer error ",error)
        channel.nack(msg,false,false)
      }
    }
  });
};
