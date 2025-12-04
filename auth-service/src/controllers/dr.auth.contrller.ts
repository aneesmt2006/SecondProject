import { inject } from "inversify";
import { controller, httpPost, } from "inversify-express-utils";
import type { interfaces } from "inversify-express-utils";
import type { IDrAuthService } from "../services/interfaces/IDrAuthService.js";
import { TYPES } from "../types/index.js";
import { validate } from "../middlewares/validator.js";
import { drRegisterSchema, loginSchema, otpSchema, resendOtpSchema } from "../utils/schemas-zod.utils.js";
import type { NextFunction, Request, Response } from "express";
import type { TDRloginRequestDTO, TDRregisterRequestDTO } from "../dtos/dr.dto.js";
import { commonResponse } from "../utils/common.reponse.utils.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { config } from "../config/env.config.js";

@controller("/auth/dr")
export class drAuthController implements interfaces.Controller {
  private _drAuthService: IDrAuthService;

  constructor(@inject(TYPES.DrAuthService) drAuthService: IDrAuthService) {
    this._drAuthService = drAuthService;
  }

  @httpPost("/register", validate(drRegisterSchema))
  public async register(req: Request, res: Response, next: NextFunction) {
    console.log("Doctor data hit:----->", req.body);
    try {
      const {
        fullName,
        email,
        phone,
        password,
        specialization,
        clinicName,
        profileImage,
        role,
      } = req.body;
      const drRegisterDTO: TDRregisterRequestDTO = {
        fullName,
        email,
        phone,
        password,
        specialization,
        clinicName,
        profileImage,
        role,
      };
      const { email: sentEmail, message } =
        await this._drAuthService.register(drRegisterDTO);
      commonResponse.success(res, message, sentEmail, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  @httpPost("/verify-otp", validate(otpSchema))
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    const { otp, email } = req.body;
    try {
      const { doctor,refreshToken,message } =
        await this._drAuthService.verifyOtp(otp, email);

      

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.refreshToken_maxAge as number, // 7d for refreshss
      });

      commonResponse.success(res, message, doctor, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  @httpPost('/resend-otp',validate(resendOtpSchema))
  async resendOtp(req:Request,res:Response,next:NextFunction){
    console.log("Dr otp hit ")
    try {
        const {message}  =  await this._drAuthService.resendOtp(req.body.email);
        commonResponse.success(res,message,'data null',200)
    } catch (error) {
        next(error)
    }
    
  }

  @httpPost('/login',validate(loginSchema))
  async login(req:Request,res:Response,next:NextFunction){
    const {email,password} = req.body
    try {
        const loginDTO:TDRloginRequestDTO = {email,password}
    const {doctor,refreshToken,message} = await this._drAuthService.login(loginDTO.email,loginDTO.password)

    

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge:config.refreshToken_maxAge as number , // 7d for refreshss
      });

      commonResponse.success(res,message,doctor,HTTP_STATUS.OK)
    } catch (error) {
        next(error)
    }

  }


}
