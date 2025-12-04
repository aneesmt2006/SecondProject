import { inject } from "inversify";
import { controller, httpPost, httpPut, httpGet, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { ISymptomsService } from "../services/interfaces/ISymptomsService.js";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller('/super-admin/symptoms')
export class AdminSymptomsController implements interfaces.Controller {
    constructor(@inject(TYPES.SymptomsService)private _symptomsService:ISymptomsService){}

    @httpPost('/create')
    async createSymptoms(req:Request,res:Response,next:NextFunction){
        console.log("Create hitttt")
       try {
         const {symptoms,message} = await this._symptomsService.create(req.body)
         commonResponse.success(res,message,symptoms,HTTP_STATUS.CREATED)
       } catch (error) {
        next(error)
       }
    }

    @role(['admin'])
    @httpPut('/update')
    async updateSymptoms(req:Request,res:Response,next:NextFunction){
        console.log("Update hit")
       try {
         const {symptoms,message} = await this._symptomsService.update(req.body)
         commonResponse.success(res,message,symptoms,HTTP_STATUS.OK)
       } catch (error) {
        next(error)
       }
    }

    @role(['admin'])
    @httpGet('/weeks')
    async getWeeks(req:Request,res:Response,next:NextFunction){
        try {
            const {symptomsDatas,message} = await this._symptomsService.findAll();
            commonResponse.success(res,message,symptomsDatas,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }

    @role(['admin','user'])
    @httpGet('/current-week/:week')
    async getCurrentWeek(req:Request,res:Response,next:NextFunction){
        try {
            const week = req.params.week
            if(!week) commonResponse.failure(res,"params week fail",400)
            const {symptomsData,message} = await this._symptomsService.findWeekData(Number(week))
            commonResponse.success(res,message,symptomsData,HTTP_STATUS.OK)
        } catch (error) {
            next(error)
        }
    }
}