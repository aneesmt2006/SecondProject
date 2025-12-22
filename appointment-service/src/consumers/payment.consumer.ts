import { getChannel, QUEUE_NAME } from "../config/rabbitmq.config.js"
import { container } from "../config/inversify.config.js";
import { TYPES } from "../types/type.js";
import type { IAppoinmentService } from "../services/interfaces/IAppoinmentService.js";

export const startPaymentConsumer = async()=>{
    try {
        const channel = getChannel() // This might throw if not connected, ensure connection calls happen before
        
        console.log("📥 Appointment Service listening to payment.success");

        channel.consume(QUEUE_NAME,async(message)=>{
            if(!message) return 
            try {
                const event = JSON.parse(message.content.toString())
                const {eventType,appointmentId,status} = event
                
                if(eventType === 'PAYMENT_SUCCESS'){
                    console.log(`Processing Payment Success for Appointment: ${appointmentId}`);
                   
                    const appoinmentService = container.get<IAppoinmentService>(TYPES.AppoinmentService);
                  
                    const {appoinment} = await appoinmentService.update(appointmentId, "SUCCESS");
                    const {appoinmentDate,appoinmentTime,doctorId,userId, appointmentId: id} = appoinment
                    console.log(`Updated Appointment ${appointmentId} to SUCCESS`);

                     // publishing event - ( for notification service)
                     console.log(`Sending event to notification service for appointment: ${id}`);
                    channel.publish('appoinment.events','appoinment.confirmed',Buffer.from(JSON.stringify({
                        pattern: 'appoinment.confirmed',
                        data: {
                            appoinmentId: id, 
                            appoinmentTime,
                            doctorId,
                            userId,
                            appoinmentDate
                        }
                    })))
                }

                channel.ack(message)
            } catch (error) {
                console.error("Error processing payment event:", error);
                // requeueeee = false to avoid infinite loops on bad messages, or true if transient
                channel.nack(message, false, false) 
            }
        })
    } catch (error) {
        console.error("Failed to start payment consumer:", error)
    }
}