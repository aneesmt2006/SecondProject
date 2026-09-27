import logger from "../utils/logger.js";
import amqp, { type ChannelModel } from 'amqplib'
import { config } from './env.config.js'


let channel : amqp.Channel
let connection :ChannelModel


const EXCHANGE_NAME='payment.events'   
const EXCHANGE_TYPE='topic'




export const connectRabbitMQ = async()=>{
   while (true) {
       try {
          connection = await amqp.connect(config.rabbitmqUrl as string)
          channel = await connection.createChannel()
          await channel.assertExchange(EXCHANGE_NAME,EXCHANGE_TYPE,{durable:true});
          
          logger.info("Rabbitmq connected sucess🟠🟠🟠")
          break;
       } catch (error) {
          logger.error("Failed to connect to RabbitMQ, retrying in 5 seconds...", error)
          await new Promise(resolve => setTimeout(resolve, 5000));
       }
   }
}


export const publishEvent= async(routingKey:string,payload:Record<string, any>)=>{
   try {
     if(!channel){
        logger.info("Rabbitmq channel is not initialized")
        return 
    }

    const messageBuffer = Buffer.from(JSON.stringify(payload))

    channel.publish(EXCHANGE_NAME,routingKey,messageBuffer,{persistent:true})
   } catch (error) {
    logger.info(error)
   }
} 


export const getChannel=()=>{
    if(!channel){
        throw new Error("Rabbit mq channel not initialized inside function")
    }

    return channel
}