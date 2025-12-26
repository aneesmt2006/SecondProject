import { injectable } from "inversify";
import type { IPaymentRepository } from "./interfaces/IPaymentCreateRepository.js";
import type { IPaymentOrder } from "../utils/interface.utils.js";
import { PaymentOrderModel } from "../models/booking.payment.model.js";

@injectable()
export class PaymentRepository implements IPaymentRepository {

    async create(payment: IPaymentOrder): Promise<IPaymentOrder> {
        return await PaymentOrderModel.create(payment)
    }

    async update(orderCreationId: string, status: string, razorpayPaymentId: string): Promise<IPaymentOrder | null> {
        return await PaymentOrderModel.findOneAndUpdate(
            { tempOrderId: orderCreationId },
            { $set: { status: status, razorpayPaymentId: razorpayPaymentId } },
            { new: true }
        );
    }

    async findByAppoinmentId(appoinmentId: string): Promise<IPaymentOrder|null> {
        return await PaymentOrderModel.findOne({appoinmentId})
    }
}