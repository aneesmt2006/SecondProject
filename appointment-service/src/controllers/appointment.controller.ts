import type { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IAppointmentService } from "../services/interfaces/IAppointmentService.js";
import { commonResponse } from "../utils/common.response.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller("/booking")
export class AppointmentController {
    constructor(@inject(TYPES.AppointmentService) private _appointmentService: IAppointmentService) {}

    @httpPost("/create")
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { appointment, message } = await this._appointmentService.create(req.body);
            return commonResponse.success(res, message, appointment, HTTP_STATUS.CREATED);
        } catch (error) {
            next(error);
        }
    }

    @httpPut('/cancel')
       async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const {appointmentId} = req.body 
            const {appointment,message} = await this._appointmentService.update(appointmentId as string,"CANCELLED")
            commonResponse.success(res,message,appointment,)
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
            const {patients,message} = await this._appointmentService.findAllDrappointments(doctorId,date)
            commonResponse.success(res,message,patients,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
    @role(['doctor','admin'])
    @httpPost('/complete')
    async complete(req:Request,res:Response,next:NextFunction){
        try {
            const {message} = await this._appointmentService.complete(req.body)
            commonResponse.success(res,message,{},HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpGet('/user/history')
    async getUserVisitHistory(req:Request,res:Response,next:NextFunction){
        try {
            const userId = req.headers['x-token-id'] as string;
            const {history,message} = await this._appointmentService.getUserVisitHistory(userId);
            commonResponse.success(res,message,history,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @httpGet('/user/main-doctor')
    async findUserMainDoctor(req:Request,res:Response,next:NextFunction){
        try {
            const userId = req.headers['x-token-id'] as string
            const {doctorId,message} = await this._appointmentService.findMainDoctor(userId)
            commonResponse.success(res,message,doctorId,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}
