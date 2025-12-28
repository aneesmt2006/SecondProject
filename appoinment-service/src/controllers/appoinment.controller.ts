import type { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpPost } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IAppoinmentService } from "../services/interfaces/IAppoinmentService.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@controller("/appoinment")
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
}
