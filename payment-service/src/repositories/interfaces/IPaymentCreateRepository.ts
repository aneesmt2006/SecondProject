import type { IPaymentOrder } from "../../utils/interface.utils.js";

export interface IPaymentRepository {
    create(payment:IPaymentOrder):Promise<IPaymentOrder>,
    update(orderCreationId:string,status:string,razorpayPaymentId:string):Promise<IPaymentOrder | null>
    findByAppoinmentId(appoinmentId:string):Promise<IPaymentOrder|null>
}