import amqp, { type Channel, type ChannelModel } from 'amqplib'
import { config } from './env.config.js';

let connection:ChannelModel;
let channel:Channel;

export const EXCHANGE_NAME = "payment.events";
export const QUEUE_NAME = "appointment.payment.success";
export const ROUTING_KEY = "payment.success";

export const connectRabbitMQ = async()=>{
   try {
     connection = await amqp.connect(config.rabbitmqUrl as string)
     channel  = await connection.createChannel();
     await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:true})
     await channel.assertExchange('appoinment.events',"topic",{durable:true})

    
     await channel.assertQueue(QUEUE_NAME,{durable:true})

     await channel.bindQueue(QUEUE_NAME,EXCHANGE_NAME,ROUTING_KEY);

     // Bind notification queue to appoinment events exchange
     const NOTIFICATION_QUEUE = 'notifications.appoinments.confirmed';
     await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
     await channel.bindQueue(NOTIFICATION_QUEUE, 'appoinment.events', 'appoinment.confirmed');

     console.log("🐰 Rabbit mq connected (appoinment service)");

   } catch (error) {
     console.log(error)
   }
}


export const getChannel =()=>{
    if(!channel){
        throw new Error("Rabbit mq channel not initialized")
    }

    return channel
}