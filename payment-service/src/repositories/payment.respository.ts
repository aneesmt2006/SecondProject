import { injectable } from "inversify";
import type { IPaymentRepository } from "./interfaces/IPaymentCreateRepository.js";
import type { IPaymentOrder } from "../utils/interface.utils.js";
import { PaymentOrderModel } from "../models/booking.payment.model.js";

@injectable()
export class PaymentRepository implements IPaymentRepository {

    async create(payment: IPaymentOrder): Promise<IPaymentOrder> {
        return await PaymentOrderModel.create(payment)
    }

    async update(orderCreationId: string, status: string): Promise<IPaymentOrder | null> {
        return await PaymentOrderModel.findOneAndUpdate({tempOrderId:orderCreationId},{$set:{status:status}},{new:true})
    }
}