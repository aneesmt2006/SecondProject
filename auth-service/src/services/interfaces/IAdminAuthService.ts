import type { TDRresponseDTO } from "../../dtos/dr.dto.js";
import type { TGetuserResponseDTO, TuserResponseDTO } from "../../dtos/user.dto.js";

export interface IAdminAuthService {
    login(email:string,password:string):Promise<{admin:TuserResponseDTO,accessToken:string,refreshToken:string,message:string}>;
    getAllUsers():Promise<{users:TGetuserResponseDTO[],message:string}>
    getAllDoctors():Promise<{doctors:TDRresponseDTO[],message:string}>
    updateDoctorStatus(id:string,status:string):Promise<{doctor:TDRresponseDTO,message:string}>
    updateUserStatus(id:string,status:boolean):Promise<{user:TuserResponseDTO,message:string}>

}