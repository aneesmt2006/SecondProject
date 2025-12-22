import { inject, injectable } from "inversify";
import type { IPaymentService } from "./interfaces/IPaymentService.js";
import { TYPES } from "../types/type.js";
import type { IPaymentRepository } from "../repositories/interfaces/IPaymentCreateRepository.js";
import type { TPaymentCreateDTO, TPaymentCreateResponseDTO } from "../dtos/payment.dto.js";
import Razorpay from "razorpay";
import { config } from "../config/env.config.js";
import { generateTempOrderId } from "../utils/tempOrderId.utils.js";
import { PAYMENT_ERRORS, PAYMENT_SUCCESS } from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import type { TPaymentVerifyDTO } from "../dtos/payment.dto.js";
import * as crypto from "crypto";
import { boolean } from "zod";
import { publishEvent } from "../config/rabbitmq.config.js";





@injectable()
export class PaymentService implements IPaymentService {
    constructor(@inject(TYPES.PaymentRespository) private _paymentRepo:IPaymentRepository){}

    async create(payment: TPaymentCreateDTO): Promise<{ payment: TPaymentCreateResponseDTO; message: string; }> {
        const instance = new Razorpay({
            key_id:config.razorpayKeyId as string,
            key_secret:config.razorpaySecret as string,
        })

        const tempOrderId = generateTempOrderId()

         const options = {
            amount: payment.amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: tempOrderId,
        };

        const razorOrder = await instance.orders.create(options)

        if(!razorOrder) throw new Error(PAYMENT_ERRORS.FAILED_CREATE_ORDER)

         const paymentDoc = await this._paymentRepo.create({tempOrderId:tempOrderId,razorpayOrderId:razorOrder.id,userId:payment.userId,doctorId:payment.doctorId,amount:payment.amount,appoinmentId:payment.appoinmentId})
         console.log("PAyment DOc----->",paymentDoc)
         
         if(!paymentDoc) throw new Error(PAYMENT_ERRORS.FAILED_DB)

        const mappedPayment = ResponseMapper.PaymentMapper(paymentDoc!,config.razorpayKeyId as string)
        return {payment:mappedPayment,message:PAYMENT_SUCCESS.CREATE_ORDER_SUCCESS}
    }


    async verify(payment: TPaymentVerifyDTO): Promise<{ status: boolean; message: string; }> {
        const {orderCreationId,razorpayOrderId,razorpayPaymentId,razorpaySignature} = payment


        const shasum = crypto.createHmac("sha256",config.razorpaySecret!).update(`${razorpayOrderId}|${razorpayPaymentId}`)
        const digest = shasum.digest("hex")

        //comparing our digest with actual one 
        if(digest!==razorpaySignature){
            throw new Error(PAYMENT_ERRORS.SIGNATURE_NOT_MATCHING)
        }

        const paymentDoc = await this._paymentRepo.update(orderCreationId,"SUCCESS")

        if(!paymentDoc) throw new Error(PAYMENT_ERRORS.FAILED_DB)

        await publishEvent("payment.success",{status:"SUCCESS",eventType:"PAYMENT_SUCCESS",paymentId:paymentDoc._id,appointmentId:paymentDoc.appoinmentId,userId:paymentDoc.userId,doctorId:paymentDoc.doctorId,amount:paymentDoc.amount,paidAt:new Date().toISOString()})

        return {status:true,message:PAYMENT_SUCCESS.PAYMNET_VERIFICATION_SUCCESS}

    }
}