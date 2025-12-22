import { Container } from "inversify";
import type { IPaymentService } from "../services/interfaces/IPaymentService.js";
import { TYPES } from "../types/type.js";
import { PaymentService } from "../services/payment.service.js";
import type { IPaymentRepository } from "../repositories/interfaces/IPaymentCreateRepository.js";
import { PaymentRepository } from "../repositories/payment.respository.js";
import "../controllers/payment.controller.js";
const container = new Container();


container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService)
container.bind<IPaymentRepository>(TYPES.PaymentRespository).to(PaymentRepository)


export { container };
