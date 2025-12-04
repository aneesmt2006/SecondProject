import type { NextFunction, Request, Response } from "express";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../types/type.js";
import type { IDoctorSlotService } from "../services/interfaces/IDoctorSlotService.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@controller("/doctor/slot")
export class DoctorSlotController {
  constructor(
    @inject(TYPES.DoctorSlotService) private doctorSlotService: IDoctorSlotService
  ) {}

  @httpPost("/upsert")
  async createOrUpdateSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      console.log("slot data------->",data)
      const doctorId = req.headers['x-token-id'] as string
      const { slot, message } = await this.doctorSlotService.createOrUpdateSlot({doctorId,...data});
      return commonResponse.success(res, message, slot, HTTP_STATUS.OK);
    } catch (error: any) {
      next(error);
    }
  }

  @httpGet("/")
  async getSlotByDoctorId(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers['x-token-id'] as string
      const { slot, message } = await this.doctorSlotService.getSlotByDoctorId(doctorId!);
      return commonResponse.success(res, message, slot, HTTP_STATUS.OK);
    } catch (error: any) {
      next(error);
    }
  }

  @httpGet("/getAllSlots")
  async getAllSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots, message } = await this.doctorSlotService.getAllSlots();
      return commonResponse.success(res, message, slots, HTTP_STATUS.OK);
    } catch (error: any) {
      next(error);
    }
  }
}
