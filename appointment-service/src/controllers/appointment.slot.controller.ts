import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { controller, httpGet, type interfaces } from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IBookSlotsService } from "../services/interfaces/IBookSlotsService.js";
import { commonResponse } from "../utils/common.response.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";


@controller("/book/slots")
export class DoctorBookSlotsController implements interfaces.Controller {
  constructor(
    @inject(TYPES.BookSlotService) private _bookSlotService: IBookSlotsService
  ) {}

  @role(['user','admin'])
  @httpGet("/")
  async getDoctorSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date } = req.query as {
        doctorId?: string;
        date?: string;
      };

      if (!doctorId || !date) {
         // Handle missing params properly
         throw new Error("Missing doctorId or date");
      }

      const { doctorSlots, message } = await this._bookSlotService.getDoctorSlots(
        doctorId,
        date
      );
      commonResponse.success(res, message, doctorSlots, HTTP_STATUS.OK)
    } catch (error) {
      next(error);
    }
  }
}
