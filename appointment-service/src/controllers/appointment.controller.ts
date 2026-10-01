import type { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
} from "inversify-express-utils";
import { TYPES } from "../types/type.js";
import type { IAppointmentService } from "../services/interfaces/IAppointmentService.js";
import { commonResponse } from "../utils/common.response.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { role } from "../decorators/role.decorator.js";

@controller("/booking")
export class AppointmentController {
  constructor(
    @inject(TYPES.AppointmentService)
    private _appointmentService: IAppointmentService,
  ) {}

  @httpPost("/create")
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointment, message } = await this._appointmentService.create(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req.body,
      );
      return commonResponse.success(
        res,
        message,
        appointment,
        HTTP_STATUS.CREATED,
      );
    } catch (error) {
      next(error);
    }
  }

  @httpPut("/cancel")
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { appointmentId } = req.body;
      const { appointment, message } = await this._appointmentService.update(
        appointmentId as string,
        "CANCELLED",
      );
      commonResponse.success(res, message, appointment);
    } catch (error) {
      next(error);
    }
  }

  @role(["doctor", "admin"])
  @httpGet("/getDrappointments")
  async getDoctorAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers["x-token-id"] as string;
      const { status } = req.query as { status?: string };
      console.log("status", status, "doctorId", doctorId);
      const { patients, message } =
        await this._appointmentService.findAllDrappointments(doctorId, status);
      commonResponse.success(res, message, patients, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
  @role(["doctor", "admin"])
  @httpPost("/complete")
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { message } = await this._appointmentService.complete(req.body);
      commonResponse.success(res, message, {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["user", "doctor"])
  @httpGet("/user/history")
  async getUserVisitHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId =
        req.headers["x-token-role"] === "user"
          ? (req.headers["x-token-id"] as string)
          : req.query.userId;
      console.log("User id is ther ?", userId);
      const { history, message } =
        await this._appointmentService.getUserVisitHistory(userId as string);
      commonResponse.success(res, message, history, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @httpGet("/user/main-doctor")
  async findUserMainDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers["x-token-id"] as string;
      const { doctorId, message } =
        await this._appointmentService.findMainDoctor(userId);
      commonResponse.success(res, message, doctorId, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["admin"])
  @httpGet("/admin/stats")
  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const period =
        (req.query.period as "daily" | "monthly" | "yearly") || "daily";
      const role = req.headers["x-token-role"] as string | undefined;
      const userId = req.headers["x-token-id"] as string | undefined;

      const { stats, message } =
        await this._appointmentService.getAdminDashboardStats(
          period,
          role,
          userId,
        );
      commonResponse.success(res, message, stats, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["admin"])
  @httpGet("/admin/list")
  async getAdminList(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filter = {};

      const { appointments, totalPages, currentPage, totalCount, message } =
        await this._appointmentService.getAdminAppointmentsList(
          page,
          limit,
          filter,
        );
      commonResponse.success(
        res,
        message,
        { appointments, totalPages, currentPage, totalCount },
        HTTP_STATUS.OK,
      );
    } catch (error) {
      next(error);
    }
  }

  @role(["admin"])
  @httpGet("/admin/booking-stats")
  async getBookingManagementStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { stats, message } =
        await this._appointmentService.getBookingManagementStats();
      commonResponse.success(res, message, stats, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["doctor"])
  @httpGet("/doctor/stats")
  async getDoctorStats(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.headers["x-token-id"] as string;
      const { stats, message } =
        await this._appointmentService.getDoctorDashboardStats(doctorId);
      commonResponse.success(res, message, stats, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}
