import { controller, httpGet, httpPost, httpPut, type interfaces } from "inversify-express-utils";
import type { IFetusService } from "../services/interfaces/IFetusService.js";
import { inject } from "inversify";
import { TYPES } from "../types/type.js";
import { validate } from "../middlewares/validate.js";
import { fetusSchema } from "../utils/schema-zod.utils.js";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";
import type { IDoctorProfileService } from "../services/interfaces/IDoctorProfileService.js";


@controller('/super-admin/fetus')
export class AdminFetusController implements interfaces.Controller{
  private _fetusService : IFetusService

  constructor(
    @inject(TYPES.FetusService)fetusService:IFetusService,
  ){
    this._fetusService = fetusService
  }
  @role(['admin'])
  @httpPost('/create',validate(fetusSchema))
  async fetusCreate(req:Request,res:Response,next:NextFunction){
    console.log('<------------------------>fetus creation Hit')
   try {
    const {fetus,message} = await this._fetusService.create(req.body)
    commonResponse.success(res,message,fetus,HTTP_STATUS.CREATED)
   } catch (error) {
     next(error)
   }
  }
  @role(['admin'])
  @httpPut('/update')
  async fetusUpdate(req:Request,res:Response,next:NextFunction){
    console.log("Update hit")
    try {
      const {fetus,message} = await this._fetusService.update(req.body)
      commonResponse.success(res,message,fetus,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  }

  @role(['admin'])
  @httpGet('/weeks')
  async getWeeks(req:Request,res:Response,next:NextFunction){
    try {
      const {fetusDatas,message} = await this._fetusService.findAll();
      commonResponse.success(res,message,fetusDatas,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  }
 
  @role(['admin','user'])
  @httpGet('/current-week/:week')
  async getCurrentWeek(req:Request,res:Response,next:NextFunction){
    try {
      const week = req.params.week
      console.log("week----->",week)
      if(!week) commonResponse.failure(res,"params week fail",400)
      const {fetusData,message} = await this._fetusService.findWeekData(Number(week))
      commonResponse.success(res,message,fetusData,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  }

 
}