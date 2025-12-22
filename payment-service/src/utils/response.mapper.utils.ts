import type { TPaymentCreateResponseDTO } from "../dtos/payment.dto.js";
import type { IPaymentOrder } from "./interface.utils.js";


export class ResponseMapper {
    static PaymentMapper(repoData:IPaymentOrder,razorPayPublickeyId:string):TPaymentCreateResponseDTO{
        return {
            razorpayOrderId:repoData.razorpayOrderId,
            tempOrderId:repoData.tempOrderId!,
            keyId:razorPayPublickeyId,
            currency:"INR",
            amount:repoData.amount,

        }
    }
}