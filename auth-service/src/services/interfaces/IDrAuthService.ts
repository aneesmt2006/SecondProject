import type { TDRgoogleAuthResponse, TDRregisterRequestDTO, TDRresponseDTO } from "../../dtos/dr.dto.js";

export interface IDrAuthService{
    register(doctorData:TDRregisterRequestDTO):Promise<{message:string,email:string}>;
    verifyOtp(otp:string,email:string):Promise<{doctor:TDRresponseDTO,accessToken:string,refreshToken:string,message:string}>;
    resendOtp(email:string):Promise<{message:string}>;
    login(email:string,password:string):Promise<{doctor:TDRresponseDTO,accessToken:string,refreshToken:string,message:string}>;
    refresh?(refreshToken:string):Promise<{accessToken:string,refreshToken:string,message:string}>,
    google?(code:string):Promise<{doctor:TDRgoogleAuthResponse,accessToken:string,refreshToken:string,message:string}>
}