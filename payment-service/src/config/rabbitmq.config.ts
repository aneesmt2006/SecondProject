import amqp, { type ChannelModel } from 'amqplib'
import { config } from './env.config.js'


let channel : amqp.Channel
let connection :ChannelModel


const EXCHANGE_NAME='payment.events'
const EXCHANGE_TYPE='topic'

export const connectRabbitMQ = async()=>{
   try {
      connection = await amqp.connect(config.rabbitmqUrl as string)
     channel = await connection.createChannel()
     await channel.assertExchange(EXCHANGE_NAME,EXCHANGE_TYPE,{durable:true})
     console.log("Rabbitmq connected sucess🟠🟠🟠")
   } catch (error) {
    console.log(error)
   }
}


export const publishEvent= async(routingKey:string,payload:Record<string, any>)=>{
   try {
     if(!channel){
        console.log("Rabbitmq channel is not initialized")
        return 
    }

    const messageBuffer = Buffer.from(JSON.stringify(payload))

    channel.publish(EXCHANGE_NAME,routingKey,messageBuffer,{persistent:true})
   } catch (error) {
    console.log(error)
   }
} 