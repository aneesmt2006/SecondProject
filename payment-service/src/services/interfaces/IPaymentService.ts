import type { TPaymentCreateDTO, TPaymentCreateResponseDTO, TPaymentVerifyDTO } from "../../dtos/payment.dto.js";

export interface IPaymentService {
    create(payment:TPaymentCreateDTO):Promise<{payment:TPaymentCreateResponseDTO,message:string}>,
    verify(payment:TPaymentVerifyDTO):Promise<{status:boolean,message:string}>

}