import logger from "../utils/logger.js";
import { inject } from "inversify";
import { controller, httpGet, httpPost, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IMedicalPrescriptionService } from "../services/interfaces/IMedicalPrescriptionService.js";
import { validate } from "../middlewares/validate.js";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { doctorPrescription } from "../utils/schema-zod.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller('/prescription')
export class PrescriptionController implements interfaces.Controller {
    constructor(@inject(TYPES.MedicalPrescriptionService) private _priscriptionService: IMedicalPrescriptionService) {}
    
    @role(['doctor'])
    @httpPost('/create', validate(doctorPrescription))
    async createPrescription(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const { data: created, message } = await this._priscriptionService.createPrescription(data);
            commonResponse.success(res, message, created, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    @role(['user', 'doctor', 'admin'])
    @httpGet('/')
    async getPrescriptionByAppointment(req: Request, res: Response, next: NextFunction) {
        logger.info("Hiiiii")
        try {
            const appointmentId = req.query.appointmentId as string;

            const { data, message } = await this._priscriptionService.getPrescriptionByAppointmentId(appointmentId);
           
            commonResponse.success(res, message, data, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}
