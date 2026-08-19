import { inject } from "inversify";
import { controller, httpGet } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IBookedDoctorsService } from "../services/interfaces/IBookedDoctorsService.js";
import type { NextFunction, Request, Response } from "express";
import { commonResponse } from "../utils/common.response.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@controller("/booked")
export class BookedDoctorsForChat {
  constructor(
    @inject(TYPES.BookedDoctorsService)
    private _bookedDoctorsService: IBookedDoctorsService,
  ) {}

  @httpGet("/doctors")
  async findBookedDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-token-id'] as string;
      const {bookedDoctors,message}  = await this._bookedDoctorsService.bookedDoctors(userId);
      commonResponse.success(res,message,bookedDoctors,HTTP_STATUS.OK)
    } catch (error) {
        next(error)
    }
  }


   @httpGet("/patients")
  async findBookedPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers['x-token-id'] as string;
      const {bookedPatients,message}  = await this._bookedDoctorsService.bookedPatients(doctorId);
      commonResponse.success(res,message,bookedPatients,HTTP_STATUS.OK)
    } catch (error) {
        next(error)
    }
  }

}
