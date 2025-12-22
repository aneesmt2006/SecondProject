import type { IPaymentOrder } from "../../utils/interface.utils.js";

export interface IPaymentRepository {
    create(payment:IPaymentOrder):Promise<IPaymentOrder>,
    update(orderCreationId:string,status:string):Promise<IPaymentOrder | null>
}