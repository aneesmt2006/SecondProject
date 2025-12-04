import { inject } from "inversify";
import { controller, httpGet, httpPut } from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import type { Request, Response, NextFunction } from "express";
import { TYPES } from "../types/type.js";
import type { IDoctorProfileService } from "../services/interfaces/IDoctorProfileService.js";
import { validate } from "../middlewares/validate.js";
import { drUpdateSchema } from "../utils/schema-zod.utils.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { role } from "../decorators/role.decorator.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@controller("/doctor/profile")
export class DoctorProfileController implements interfaces.Controller {
  constructor(@inject(TYPES.DoctorProfileService) private _doctorProfileService: IDoctorProfileService) {}

  @httpPut("/update", validate(drUpdateSchema))
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers['x-token-id'] as string;
      console.log("doctorId from contoller---->",doctorId)
      const { profile, message } = await this._doctorProfileService.updateProfile(doctorId, req.body);
      commonResponse.success(res,message,profile,HTTP_STATUS.OK)
    } catch (error) {
      next(error);
    }
  }

  @httpGet("/")
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers['x-token-id'] as string;
      const { profile, message } = await this._doctorProfileService.getProfile(doctorId);
      commonResponse.success(res,message,profile,HTTP_STATUS.OK)
    } catch (error) {
      next(error);
    }
  }


  @role(['admin'])
  @httpGet('/allDoctors')
  async getAllDoctors(req:Request,res:Response,next:NextFunction){
    try {
      const {profiles,message} = await this._doctorProfileService.getAllDoctors();
      commonResponse.success(res,message,profiles,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  }
}
