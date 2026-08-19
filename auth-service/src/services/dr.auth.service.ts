import { inject, injectable } from "inversify";
import type { IDrAuthService } from "./interfaces/IDrAuthService.js";
import type { IDrAuthRepository } from "../repositories/interfaces/IDrAuthRepository.js";
import type { IOtpService } from "./interfaces/IOtpService.js";
import { TYPES } from "../types/index.js";
import type { TDRessentialDTO, TDRregisterRequestDTO, TDRresponseDTO } from "../dtos/dr.dto.js";
import { CONSTANTS } from "../constants/constants.js";
import bcrypt from "bcryptjs";
import { AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import type { IDoctor } from "../utils/interface.utils.js";
import { _generateTokens } from "../utils/jwt.utils.js";
import { ResponseMapper } from "../utils/response.utils.js";
import { UNALLOWED_STATUS } from "../utils/unallowed.status.utils.js";
import { redisClient } from "../config/redis.config.js";

@injectable()
export class DrAuthService implements IDrAuthService {
   private _drRepo : IDrAuthRepository;
   private _otpService: IOtpService;
   constructor(@inject(TYPES.DrAuthRepository) drRepo:IDrAuthRepository,@inject(TYPES.OTPService) OTPservice:IOtpService){
    this._drRepo = drRepo;
    this._otpService = OTPservice;
   }

  /**
   * Registers a new doctor (initial step, sends OTP)
   * @param doctorData - Doctor registration data
   * @returns Success message + email
   */
  async register(doctorData: TDRregisterRequestDTO): Promise<{ message: string; email: string; }> {
    const {email,password} = doctorData
    const existing =  await this._drRepo.findByEmail(email)
    if(existing){
        throw new Error(CONSTANTS.ERRORS.USER_EXISTS)
    }
    
     doctorData.password = await bcrypt.hash(password,10);
     this._otpService.validateAndSendOtp(email,doctorData);

     return {message:AUTH_RESPONSE_MESSAGES.OTP_SEND_SUCCESS,email}
    
   }

   /**
    * Verifies OTP and creates doctor account
    * @param otp - OTP string
    * @param email - Doctor email
    * @returns Doctor DTO, tokens, and success message
    */
   async verifyOtp(otp: string, email: string): Promise<{doctor: TDRresponseDTO; accessToken: string; refreshToken: string; message: string; }> {
       const storedOTP = await this._otpService.getOTP(email)

       if(!storedOTP||storedOTP !== otp){
        throw new Error(CONSTANTS.ERRORS.INVALID_OTP)
       }

       const tempDoctor  = await this._otpService.getTempUser(email);
       console.log("Redis stored temp--->",tempDoctor)

       const savedDoc = await this._drRepo.create(tempDoctor as unknown as IDoctor);

        await this._otpService.deleteOTP(email);
        await this._otpService.deleteTempUser(email);

       const {accessToken,refreshToken}  = _generateTokens(savedDoc._id as string,savedDoc.role,savedDoc.email)

       console.log("saved dr doc--->",savedDoc)
       const mappedDoctor = ResponseMapper.doctorResponseMapping(savedDoc,accessToken)

       return {doctor:mappedDoctor,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.VERIFY_ACCOUNT_SUUCESS}
   }


   /**
    * Resends OTP for doctor registration
    * @param email - Doctor email
    * @returns Success message
    */
   async resendOtp(email: string): Promise<{ message: string; }> {
       const tempDoctor = await this._otpService.getTempUser(email)
       if(!tempDoctor){
        throw new Error(CONSTANTS.ERRORS.TIME_OUT_OTP)
       }
        
       console.log("Email----",email)

         this._otpService.validateAndSendOtp(email,tempDoctor)
        return {message:AUTH_RESPONSE_MESSAGES.RESEND_OTP_SUCCESS}
   }

   /**
    * Logs in a doctor
    * @param email - Doctor email
    * @param password - Doctor password
    * @returns Doctor DTO, tokens, and success message
    */
   async login(email: string, password: string): Promise<{ doctor: TDRresponseDTO; accessToken: string; refreshToken: string; message: string; }> {
       const doctor = await this._drRepo.findByEmail(email)
       
       if(!doctor){
        throw new Error(CONSTANTS.ERRORS.USER_NOT_FOUND)
       }
         
       
       if(!doctor.password){
        throw new Error(CONSTANTS.ERRORS.MISSING_PASS)
       }

        const isCorrect = await bcrypt.compare(password,doctor.password!);

        if(!isCorrect){
            throw new Error(CONSTANTS.ERRORS.INVALID_CREDENTIALS_SIMPLE)
        }

        console.log(" db doctor data",doctor,'status--->',doctor.status)


        if(UNALLOWED_STATUS.includes(doctor.status!)){
         throw new Error(CONSTANTS.ERRORS.BLOCKED_BY_ADMIN)
        }

         const {accessToken,refreshToken,redisExpireSeconds} = _generateTokens(doctor._id!,doctor.role,doctor.email)

        await redisClient.set(`refresh:${doctor._id}`,refreshToken,{EX:redisExpireSeconds})
         const mappedDoctor = ResponseMapper.doctorResponseMapping(doctor,accessToken)

         return {doctor:mappedDoctor,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.LOGIN_SUCCESS}
   }

   /**
    * Retrieves essential doctor details
    * @param doctorId - Doctor ID
    * @returns Doctor essential DTO + success message
    */
   async getDoctorEssentials(doctorId: string): Promise<{ doctor: TDRessentialDTO; message: string; }> {
       const doctorDoc = await this._drRepo.findById(doctorId)
       if(!doctorDoc){
        throw new Error(CONSTANTS.ERRORS.DB_NOT_EXIST)
       }
       const  mappedDR = {fullName:doctorDoc.fullName,clinicName:doctorDoc.clinicName!,doctorId}

       return {doctor:mappedDR,message:AUTH_RESPONSE_MESSAGES.GET_DOCTOR}
       } 
      
   }
