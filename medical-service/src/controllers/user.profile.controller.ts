import logger from "../utils/logger.js";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
} from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import type { Request, Response, NextFunction } from "express";
import { TYPES } from "../types/type.js";
import type { IUserProfileService } from "../services/interfaces/IUserProfileService.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { validate } from "../middlewares/validate.js";
import { pregnantProfileSchema } from "../utils/schema-zod.utils.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { role } from "../decorators/role.decorator.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import userProfileModel from "../models/user.profile.model.js";

@controller("/patient/profile")
export class UserProfileController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserProfileService)
    private _userProfileService: IUserProfileService,
  ) {}

  @role(["user", "admin"])
  @httpPost("/create", validate(pregnantProfileSchema))
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers["x-token-id"] as string;
      const { message, profile } = await this._userProfileService.createProfile(
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req.body,
      );
      commonResponse.success(res, message, profile, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  @role(["user", "admin"])
  @httpPut("/update", validate(pregnantProfileSchema))
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers["x-token-id"] as string;
      const { profile, message } = await this._userProfileService.updateProfile(
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        req.body,
      );
      commonResponse.success(res, message, profile, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["user", "admin"])
  @httpGet("/")
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers["x-token-id"] as string;
      const { profile, message } =
        await this._userProfileService.getProfile(userId);
      commonResponse.success(res, message, profile, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["doctor", "admin", "user"])
  @httpPost("/forDoctors")
  async getPatientProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Hitted medical service ----->", req.body);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const patientIds = req.body.patientIds || req.body;
      const { profiles, message } =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this._userProfileService.getPatientsProfile(patientIds);
      commonResponse.success(res, message, profiles, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["doctor", "admin", "user"])
  @httpGet("/medical-record")
  async getMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const authUserId = req.headers["x-token-id"] as string;
      const targetUserId = (req.query.userId as string) || authUserId;

      const { medicalRecord, message } =
        await this._userProfileService.getPatientMedicalRecord(targetUserId);
      commonResponse.success(res, message, medicalRecord, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["user"])
  @httpPut("/primaryDoctor")
  async setPrimaryDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { doctorId } = req.body;
      const authUserId = req.headers["x-token-id"] as string;
      const { profile, message } =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this._userProfileService.setPrimaryDoctor(doctorId, authUserId);
      commonResponse.success(res, message, profile, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @role(["user"])
  @httpGet("/primaryDoctor")
  async getPrimaryDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const authUserId = req.headers["x-token-id"] as string;
      const authUserRole = req.headers["x-token-role"] as string;
      const { drProfile, message } =
        await this._userProfileService.getPrimaryDoctor(
          authUserId,
          authUserRole,
        );
      commonResponse.success(res, message, drProfile, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}
