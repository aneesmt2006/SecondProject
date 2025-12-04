import { inject } from "inversify";
import { controller, httpGet, httpPost, httpPut } from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import type { Request, Response, NextFunction } from "express";
import { TYPES } from "../types/type.js";
import type { IUserProfileService } from "../services/interfaces/IUserProfileService.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { validate } from "../middlewares/validate.js";
import { pregnantProfileSchema } from "../utils/schema-zod.utils.js";
import { commonResponse } from "../utils/common.reponse.utils.js";

@controller("/patient/profile")
export class UserProfileController implements interfaces.Controller {
  constructor(@inject(TYPES.UserProfileService) private _userProfileService: IUserProfileService) {}

  @httpPost('/create',validate(pregnantProfileSchema))
  async createProfile(req:Request,res:Response,next:NextFunction){
    try {
      const userId = req.headers['x-token-id']  as string
      const {message,profile} = await this._userProfileService.createProfile(userId,req.body)
      commonResponse.success(res,message,profile,HTTP_STATUS.CREATED)
    } catch (error) {
      next(error)
    }
  }

  @httpPut("/update", validate(pregnantProfileSchema))
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-token-id'] as string;
      const { profile, message } = await this._userProfileService.updateProfile(userId, req.body);
      commonResponse.success(res,message,profile,HTTP_STATUS.OK)
    } catch (error) {
      next(error);
    }
  }

  @httpGet("/")
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-token-id'] as string;
      const { profile, message } = await this._userProfileService.getProfile(userId);
     commonResponse.success(res,message,profile,HTTP_STATUS.OK)
    } catch (error) {
      next(error);
    }
  }
}
