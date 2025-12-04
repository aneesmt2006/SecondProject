import { injectable, inject } from "inversify";
import bcrypt from "bcryptjs";
import { config } from "../config/env.config.js";
import { TYPES } from "../types/index.js";
import { CONSTANTS } from "../constants/constants.js";
import jwt, { type Secret } from "jsonwebtoken";
import type { IAuthService } from "./interfaces/IAuthService.js";
import type { IAuthRepository } from "../repositories/interfaces/IAuthRepository.js";
import { redisClient } from "../config/redis.config.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.utils.js";
import type { IOtpService } from "./interfaces/IOtpService.js";
import type { TgoogleAuthResponse, TregisterRequestDTO, TuserResponseDTO } from "../dtos/user.dto.js";
import { ResponseMapper } from "../utils/response.utils.js";
import { AUTH_RESPONSE_MESSAGES, USER_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { oauth2Client } from "../utils/google.utils.js";
import axios from "axios";
import type {  IUser } from "../utils/interface.utils.js";


@injectable()
export class AuthService implements IAuthService {
  private _authRepo: IAuthRepository;
  private _otpService:IOtpService;
  constructor(@inject(TYPES.AuthRepository) authRepo: IAuthRepository,@inject(TYPES.OTPService) otpService:IOtpService) {
    this._authRepo = authRepo;
    this._otpService = otpService
  }

  private _generateTokens(userId: string, role: string,email:string) {
     const accessToken  =  createAccessToken(userId,role,email)
     const refreshToken = createRefreshToken(userId)

    // calculation of redis EX seconds
    const redisExpireSeconds = this._parseExpiresToSeconds(
      config.jwtRefreshExpiresIn,
    );

    return { accessToken, refreshToken, redisExpireSeconds };
  }
  
  /**
   * 
   * @param expiresIn 
   * @returns 
   */

  private _parseExpiresToSeconds(expiresIn: string) {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24,
    };
    const match = expiresIn.match(/(\d+)([smhd])/i);
    if (!match) return 60 * 60 * 24 * 7; // 7day
    const [, value, unit] = match;
    return parseInt(value as string) * (timeUnits[unit!.toLowerCase()] || 1);
  }

  async register(
    userData: TregisterRequestDTO,
  ): Promise<{message:string,email:string}> {
    const {email,password} = userData
    const existing = await this._authRepo.findByEmail(userData.email);
    if (existing) {
      throw new Error(CONSTANTS.ERRORS.USER_EXISTS);
    }

     userData.password = await bcrypt.hash(password,10)
     console.log("/register------------>",userData)
     this._otpService.validateAndSendOtp(email,userData); 
     return {message:AUTH_RESPONSE_MESSAGES.OTP_SEND_SUCCESS,email:userData.email}
  
  }

  async verifyOtp(otp:string,email:string): Promise<{ user: TuserResponseDTO; accessToken: string; refreshToken: string;message:string }> {
     
    console.log("OTP verify email from service:",email)
    
    const storedOTP = await this._otpService.getOTP(email) 
    console.log("redis stored OTP",storedOTP)
    console.log("Input OTP",otp)
    if(!storedOTP||storedOTP !== otp) {
      throw new Error(CONSTANTS.ERRORS.INVALID_OTP);
    }
    
    const tempUser = await this._otpService.getTempUser(email);
    console.log("from auth service temp user storedddata--->",tempUser)
    if (!tempUser) {
      throw new Error(CONSTANTS.ERRORS.TIME_OUT_OTP);
    }
   
    const savedDoc = await this._authRepo.create(tempUser);

    await this._otpService.deleteOTP(email);
    await this._otpService.deleteTempUser(email);
   

    // generate tokens
    const { accessToken, refreshToken, redisExpireSeconds } = this._generateTokens(savedDoc._id!.toString(), savedDoc.role,savedDoc.email);
    await redisClient.set(`refresh:${savedDoc._id}`, refreshToken, {
      EX: redisExpireSeconds,
    });

    
     const mappedUser = ResponseMapper.userResponseMapping(savedDoc,accessToken)
    
    return {user:mappedUser,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.VERIFY_ACCOUNT_SUUCESS}

  }

  async resendOtp(email: string): Promise<{ message: string; }> {
    const tempUser = await this._otpService.getTempUser(email);
    if (!tempUser) {
      throw new Error(CONSTANTS.ERRORS.TIME_OUT_OTP);
    }
    this._otpService.validateAndSendOtp(email,tempUser)
    return {message:AUTH_RESPONSE_MESSAGES.RESEND_OTP_SUCCESS}
  }



  async login(email: string, password: string):  Promise<{ user:TuserResponseDTO; accessToken: string; refreshToken: string;message:string }> {
    console.log("eamil",email)
    const user = await this._authRepo.findByEmail(email);
    
    
    console.log("user",user)
    if(!(user?.password)){
        throw Error(CONSTANTS.ERRORS.GOOGLE_ACCNT_USER)
    }

    const isCorrect = await bcrypt.compare(password,user?.password as string)
    if(user?.accountMethod==='normal'){
      if(!user || !isCorrect){
        throw new Error(CONSTANTS.ERRORS.INVALID_CREDENTIALS);
    }
    }
  
    const {accessToken,refreshToken,redisExpireSeconds} = this._generateTokens(user._id!.toString(),user.role,user.email);

    
    await redisClient.set(`refresh:${user._id}`,refreshToken,{EX:redisExpireSeconds});

    console.log("Login user----->",user)
    const mappedUser = ResponseMapper.userResponseMapping(user,accessToken);
    return {user:mappedUser,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.LOGIN_SUCCESS};
  }




  async refresh(refreshToken:string): Promise<{ accessToken: string; refreshToken: string;message:string }> {
    
      const decoded = jwt.verify(refreshToken,config.jwtRefreshSecret as Secret) as {id:string}
    
    const storedToken = await redisClient.get(`refresh:${decoded.id}`);

    if(storedToken!==refreshToken){
      throw new Error(CONSTANTS.ERRORS.INVALID_REFRESH_TOKEN);
    } 

    const user = await this._authRepo.findById(decoded.id);
    if(!user) throw new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);

    const {accessToken,refreshToken:newRefreshToken,redisExpireSeconds} = this._generateTokens(user._id!.toString(),user.role,user.email);
    await redisClient.set(`refresh:${user._id}`,newRefreshToken,{EX:redisExpireSeconds});
    return {accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.REFRESH_TOKEN_SUCCCESS}
   
  }

  async google(code:string): Promise<{ user: TgoogleAuthResponse; accessToken: string; refreshToken: string; message: string; }> {
   const googleRes =   await oauth2Client.getToken(code);

   oauth2Client.setCredentials(googleRes.tokens)

   const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
   let isExistGoogleUser = await this._authRepo.findByEmail(userRes.data.email);
   
   if(!isExistGoogleUser){
    const extractData:IUser = {
     full_name:userRes.data.name,
     email:userRes.data.email,
     accountMethod:"google",
     role:"user",
     dateOfBirth:'',
   }
    isExistGoogleUser = await this._authRepo.create(extractData);
   }

   const mappedUser = ResponseMapper.userResponseMapping(isExistGoogleUser!); // may be the token is undefined or not


   const {accessToken,refreshToken,redisExpireSeconds} = this._generateTokens(isExistGoogleUser!._id as string,"user",isExistGoogleUser!.email) 
   await redisClient.set(`refresh:${isExistGoogleUser!._id}`,refreshToken,{EX:redisExpireSeconds})
   mappedUser.accessToken = accessToken

   return {user:mappedUser,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.GOOGLE_REGISTER_SUCCESS}

  }


}
