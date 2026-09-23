import logger from "../utils/logger.js";
import { inject } from "inversify";
import { controller, httpGet, httpPost, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IPaymentService } from "../services/interfaces/IPaymentService.js";
import { validate } from "../middlewares/validator.js";
import { paymentInitiateSchema, paymentVerifySchema } from "../utils/schema-zod.utils.js";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";





@controller('/create')
export class PaymentController implements interfaces.Controller {
    constructor(@inject(TYPES.PaymentService)private _paymentService:IPaymentService){}

    @httpPost('/order',validate(paymentInitiateSchema))
    async createOrder(req:Request,res:Response,next:NextFunction){
        logger.info("Payment controlelr hit--->>>>",req.body)
        try {
            const {message,payment}  =  await this._paymentService.create(req.body)
            commonResponse.success(res,message,payment,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpPost('/verify',validate(paymentVerifySchema))
    async verifyPayment(req:Request,res:Response,next:NextFunction){
        try {
            const {message,status} = await this._paymentService.verify(req.body)
            commonResponse.success(res,message,status,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpGet('/internal/dashboard-stats')
    async getInternalDashboardStats(req:Request, res:Response, next:NextFunction){
        try {
            const period = (req.query.period as 'daily' | 'monthly' | 'yearly') || 'daily';
            const { stats, message } = await this._paymentService.getAdminDashboardStats(period);
            commonResponse.success(res, message, stats, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}