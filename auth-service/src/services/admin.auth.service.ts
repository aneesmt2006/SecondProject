import { inject, injectable } from "inversify";
import type { TGetuserResponseDTO, TuserResponseDTO } from "../dtos/user.dto.js";

import type { IAdminAuthService } from "./interfaces/IAdminAuthService.js";
import { TYPES } from "../types/index.js";
import type { IAdminAuthRepository } from "../repositories/interfaces/IAdminRepository.js";
import { ADMIN_RESPONSE_MESSAGES, AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { CONSTANTS } from "../constants/constants.js";
import bcrypt from "bcryptjs";
import { _generateTokens } from "../utils/jwt.utils.js";
import { redisClient } from "../config/redis.config.js";
import { ResponseMapper } from "../utils/response.utils.js";
import type { TDRresponseDTO } from "../dtos/dr.dto.js";


@injectable()
export class AdminAuthService implements IAdminAuthService{
  
  private _adminRepo : IAdminAuthRepository
  constructor(@inject(TYPES.AdminAuthRepository)adminRepo:IAdminAuthRepository){
      this._adminRepo = adminRepo
  }
  async login(email: string, password: string): Promise<{admin:TuserResponseDTO,accessToken:string,refreshToken:string,message:string}> {
       const exist =  await this._adminRepo.findByEmail(email);

       if(!exist) throw new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);
       if(exist.role!=='admin' && exist.accountMethod==='normal') throw new Error(CONSTANTS.ERRORS.NOT_ADMIN)

       const isCorrect = await bcrypt.compare(password,exist.password!);
       if(!isCorrect){
        throw new Error(CONSTANTS.ERRORS.INVALID_CREDENTIALS)
       }

       const {accessToken,refreshToken,redisExpireSeconds} = _generateTokens(exist._id!,exist.role,exist.email);
       
       await redisClient.set(`refresh:${exist._id}`,refreshToken,{EX:redisExpireSeconds})

       const mappedAdmin = ResponseMapper.userResponseMapping(exist)
       return {admin:mappedAdmin,accessToken,refreshToken,message:AUTH_RESPONSE_MESSAGES.LOGIN_SUCCESS}
   }

   async getAllUsers(): Promise<{ users: TGetuserResponseDTO[]; message: string; }> {
       const usersDoc = await this._adminRepo.findUsers();

       if(!usersDoc)throw new Error(CONSTANTS.ERRORS.DB_NOT_EXIST)


        console.log("Fetch from db---->",usersDoc)

 const mappedUsers = usersDoc.map((user) => {

  return {
    id: user._id!,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone!,
    dateOfBirth: user.dateOfBirth || "",
    profileImage: user.profileImage || "",

    role: user.role,
    createdAt: user.createdAt!,
    updatedAt: user.updatedAt!,
    status:user.isActive
  };
});

 console.log("Mapped users get all---->",mappedUsers)


        return {users:mappedUsers,message:ADMIN_RESPONSE_MESSAGES.FETCHED_SUCCESS}


   }

   async getAllDoctors(): Promise<{ doctors: TDRresponseDTO[]; message: string; }> {
       const doctorsDoc = await this._adminRepo.findDoctors();

       if(!doctorsDoc)throw new Error(CONSTANTS.ERRORS.DB_NOT_EXIST)

       const mappedDoctors = doctorsDoc.map((dr) => {
          return {
            id:dr._id!,
            fullName: dr.fullName!,
            email: dr.email!,
            phone: dr.phone!,
            specialization: dr.specialization!,
            clinicName: dr.clinicName!,
            role:dr.role!,
            status: dr.status!
          };
        });

        return {doctors:mappedDoctors,message:AUTH_RESPONSE_MESSAGES.GET_DOCTOR}
   }

   async updateDoctorStatus(id: string, status: string): Promise<{ doctor: TDRresponseDTO; message: string; }> {
       const updatedDoctor = await this._adminRepo.updateDoctorStatus(id,status);

       console.log("Update status doc -------->",updatedDoctor);
       if(!updatedDoctor) throw new Error(CONSTANTS.ERRORS.DB_NOT_EXIST)
       
       const mappedDoctor = {
        id:updatedDoctor._id!,
        fullName: updatedDoctor.fullName!,
        email: updatedDoctor.email!,
        phone: updatedDoctor.phone!,
        specialization: updatedDoctor.specialization!,
        clinicName: updatedDoctor.clinicName!,
        role:updatedDoctor.role!,
        status: updatedDoctor.status!
       }
       return {doctor:mappedDoctor,message:ADMIN_RESPONSE_MESSAGES.STATUS_UPDATED}
   }

   async updateUserStatus(id: string, status: boolean): Promise<{ user: TuserResponseDTO; message: string; }> {
     const usersDoc = await this._adminRepo.updateUserStatus(id,status)

     if(!usersDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.DB_CHANGE_FAILED)

     const mappedUser = ResponseMapper.userResponseMapping(usersDoc)

     return {user:mappedUser,message:ADMIN_RESPONSE_MESSAGES.STATUS_UPDATED}
   }
}