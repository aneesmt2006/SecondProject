
import type { TuserResponseDTO,TregisterRequestDTO, TgoogleAuthResponse } from "../../dtos/user.dto.js";
export interface IAuthService {
  register(userData: TregisterRequestDTO):Promise<{message:string,email:string}>;
  verifyOtp(otp:string,email:string): Promise<{ user:TuserResponseDTO; accessToken: string; refreshToken: string;message:string }>;
  resendOtp(email:string):Promise<{message:string}>;
  login(email:string, password:string):  Promise<{ user:TuserResponseDTO; accessToken: string; refreshToken: string;message:string }>;
  refresh(refreshToken:string): Promise<{accessToken:string,refreshToken:string,message:string}>;
  google(code:string):Promise<{user:TgoogleAuthResponse,accessToken:string,refreshToken:string,message:string}>

}
