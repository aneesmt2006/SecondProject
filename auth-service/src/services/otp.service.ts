import { injectable } from "inversify";
import { mailTransporter } from "../config/mail.config.js";
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { config } from "../config/env.config.js";
import { redisClient } from "../config/redis.config.js";
import { CONSTANTS } from "../constants/constants.js";
import type { IUser } from "../utils/interface.utils.js";
import type { IOtpService } from "./interfaces/IOtpService.js";


@injectable()
export class OTPservice implements IOtpService {
    private _transporter : nodemailer.Transporter ;

    constructor(){
        this._transporter = mailTransporter
    }

    async storeTempUser(email: string, userData:IUser): Promise<void> {

    await redisClient.set(`tempUser:${email}`, JSON.stringify(userData), { EX:300});
  }

  async getTempUser(email: string): Promise<IUser | null> {
    const data = await redisClient.get(`tempUser:${email}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteTempUser(email: string): Promise<void> {
    await redisClient.del(`tempUser:${email}`);
  }

    generateOTP():string{
      return crypto.randomInt(100000,999999).toString()
    }

    async storeOTP(email:string,otp:string){
        await redisClient.set(`otp:${email}`,otp,{EX:200});

    }

    async getOTP(email:string){
        return await redisClient.get(`otp:${email}`)
    }

   

   async deleteOTP(email: string): Promise<void> {
          await redisClient.del(`otp:${email}`)
    }

    async sendOTP(email:string,otp:string):Promise<void>{
        const mailOptions = {
            from:config.userMail,
            to:email,
            subject:CONSTANTS.OTP.SUBJECT,
            text:`Your OTP for registration is: ${otp}. It expires in 2 minutes. Do not share with anyone.`,
        }

        try {
            await this._transporter.sendMail(mailOptions)
        } catch (error) {
            console.error("Email sent Error",error)
            throw new Error(CONSTANTS.ERRORS.EMAIL_SEND_FAILED)
        }
    }

    async validateAndSendOtp(email:string,userData:IUser){
        const OTP = this.generateOTP();
        await this.storeOTP(email,OTP);
        await this.storeTempUser(email,userData)
        await this.sendOTP(email,OTP);
    }

}