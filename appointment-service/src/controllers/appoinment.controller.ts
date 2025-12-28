import type { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IAppoinmentService } from "../services/interfaces/IAppoinmentService.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller("/booking")
export class AppoinmentController {
    constructor(@inject(TYPES.AppoinmentService) private _appoinmentService: IAppoinmentService) {}

    @httpPost("/create")
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { appoinment, message } = await this._appoinmentService.create(req.body);
            return commonResponse.success(res, message, appoinment, HTTP_STATUS.CREATED);
        } catch (error) {
            next(error);
        }
    }

    @httpPut('/cancel')
       async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const {appointmentId} = req.body 
            const {appoinment,message} = await this._appoinmentService.update(appointmentId as string,"CANCELLED")
            commonResponse.success(res,message,appoinment,)
        } catch (error) {
            next(error);
        }
    }

    @role(['doctor','admin'])
    @httpGet('/getDrappointments')
    async getDoctorAppointments(req:Request,res:Response,next:NextFunction){
        try {
            const doctorId = req.headers['x-token-id'] as string
            const { date } = req.query as { date?: string };
            console.log("date",date,"doctorId",doctorId)
            const {patients,message} = await this._appoinmentService.findAllDrappointments(doctorId,date)
            commonResponse.success(res,message,patients,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
    @role(['doctor','admin'])
    @httpPost('/complete')
    async complete(req:Request,res:Response,next:NextFunction){
        try {
            const {message} = await this._appoinmentService.complete(req.body)
            commonResponse.success(res,message,{},HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpGet('/user/history')
    async getUserVisitHistory(req:Request,res:Response,next:NextFunction){
        try {
            const userId = req.headers['x-token-id'] as string;
            const {history,message} = await this._appoinmentService.getUserVisitHistory(userId);
            commonResponse.success(res,message,history,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpGet('/user/main-doctor')
    async findUserMainDoctor(req:Request,res:Response,next:NextFunction){
        try {
            const userId = req.headers['x-token-id'] as string
            const {doctorId,message} = await this._appoinmentService.findMainDoctor(userId)
            commonResponse.success(res,message,doctorId,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}
