import { inject } from "inversify";
import { controller, httpPost, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IUserSymptomsService } from "../services/interfaces/IUserSymptomsService.js";
import type { Request, Response, NextFunction } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";
import { idHandler } from "../middlewares/idHandler.js";

@controller('/user/symptoms')
export class UserSymptomsController implements interfaces.Controller {
    constructor(@inject(TYPES.UserSymptomsService) private _userSymptomsService: IUserSymptomsService) {}

    @role(['user'])
    @httpPost('/log')
    async logSymptoms(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = idHandler(req, res, next);
            if (!userId) return commonResponse.failure(res, "User ID missing", HTTP_STATUS.UNAUTHORIZED);

            // Log payload for debugging
            console.log("Log symptoms payload:", req.body);

            const { week, selectedNormalSymptoms, selectedAbnormalSymptoms } = req.body;
            
            const result = await this._userSymptomsService.logSymptoms({
                week: Number(week),
                selectedNormalSymptoms,
                selectedAbnormalSymptoms,
                userId
            });

            commonResponse.success(res, result.message, result.data, HTTP_STATUS.CREATED);
        } catch (error) {
            next(error);
        }
    }
}
