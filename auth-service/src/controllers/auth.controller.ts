import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
} from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import { TYPES } from "../types/index.js";
import { validate } from "../middlewares/validator.js";
import {
  registerSchema,
  loginSchema,
  otpSchema,
  resendOtpSchema,
  lmpSchema,
} from "../utils/schemas-zod.utils.js";
import type { NextFunction, Request, Response } from "express";
import type { IAuthService } from "../services/interfaces/IAuthService.js";
import { AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { config } from "../config/env.config.js";
import type { TloginRequesDTO } from "../dtos/user.dto.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { idHandler } from "../middlewares/idHandler.js";

@controller("/auth")
export class AuthController implements interfaces.Controller {
  private _authService: IAuthService;

  constructor(@inject(TYPES.AuthService) service: IAuthService) {
    this._authService = service;
  }

  @httpPost("/register", validate(registerSchema))
  public async register(req: Request, res: Response, next: NextFunction) {
    console.log("Register hit");
    try {
      
      const { email: otpSendEmail, message } =
        await this._authService.register(req.body);
      commonResponse.success(res, message, otpSendEmail,HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/basic-profile',validate(lmpSchema))
  public async updateLmp(req:Request,res:Response,next:NextFunction){
    try {
      const id = idHandler(req,res,next)
      console.log("Id from middlware-->",id)
      const {user,message} = await this._authService.lmpUpdate(id,req.body)
      commonResponse.success(res,message,user,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  } 

  @httpPost("/login", validate(loginSchema))
  public async login(req: Request, res: Response, next: NextFunction) {
    console.log("Login hit");
    try {
      const { email, password } = req.body;
      const loginDTO: TloginRequesDTO = { email, password };
      const {message, refreshToken, user } =
        await this._authService.login(loginDTO.email, loginDTO.password);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.refreshToken_maxAge as number, // 7 day
      });

      commonResponse.success(res, message, user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @httpPost("/refresh")
  public async refresh(req: Request, res: Response, next: NextFunction) {
    console.log("Refresh Hit");
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        commonResponse.failure(
          res,
          AUTH_RESPONSE_MESSAGES.REFRESH_TOKEN_MISSING,
          400,
        );
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        message,
      } = await this._authService.refresh(refreshToken);
      commonResponse.success(
        res,
        message,
        { accessToken, newRefreshToken },
        HTTP_STATUS.OK,
      );
    } catch (error) {
      next(error);
    }
  }

  @httpPost("/verify-otp", validate(otpSchema))
  public async verifyOtp(req: Request, res: Response, next: NextFunction) {
    const { otp, email } = req.body;
    console.log("Verify OTP hit", otp, email);
    try {
      const {refreshToken, user, message } =
        await this._authService.verifyOtp(otp, email);

      res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.refreshToken_maxAge as number, // 7d for refreshss
      });

      commonResponse.success(res, message,user, HTTP_STATUS.CREATED);
    } catch (error) {
      console.error("Error at verify-otp:", error);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      // res.status(400).json({ message: (error as Error).message });
      next(error);
    }
  }

  @httpPost("/resend-otp", validate(resendOtpSchema))
  public async resendOtp(req: Request, res: Response, next: NextFunction) {
    console.log("Resend OTP hit");
    try {
      const { message } = await this._authService.resendOtp(req.body.email);
      commonResponse.success(res, message, "data null", HTTP_STATUS.OK);
    } catch (error) {
      console.error("Error at resend-otp:", error);
      next(error);
    }
  }

  @httpGet("/google")
  public async authGoogle(req: Request, res: Response, next: NextFunction) {
    const { code } = req.query;

    try {
      const { message, user,refreshToken } =
        await this._authService.google(code as string);
      // Set httpOnly cookies
 

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.refreshToken_maxAge as number, // 7d for refreshss
      });
      commonResponse.success(res, message, user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }


  @httpGet('/basic-profile')
  async getBasicProfile(req:Request,res:Response,next:NextFunction){
    try {
      const id = idHandler(req,res,next)
      const {message,user} = await this._authService.getBaseProfile(id)
      commonResponse.success(res,message,user,HTTP_STATUS.OK)
    } catch (error) {
      next(error)
    }
  }
}
