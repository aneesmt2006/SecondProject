import type { TDRresponseDTO } from "../dtos/dr.dto.js";
import type { TuserResponseDTO } from "../dtos/user.dto.js";
import type { IDoctor, IUser } from "./interface.utils.js";

export class ResponseMapper {
  static  userResponseMapping(repoData:IUser,token?:string): TuserResponseDTO {
    return {
      id: repoData._id!,
      full_name: repoData.full_name,
      email: repoData.email,
      dateOfBirth: repoData.dateOfBirth || '',
      phone: repoData.phone||'',
      role: repoData.role,
      createdAt: repoData.createdAt!,
      updatedAt: repoData.updatedAt!,
      accessToken:token||'',
      isActive:repoData.isActive!
    };
  }

  static doctorResponseMapping(repoData:IDoctor,token?:string):TDRresponseDTO{
    return {
      id:repoData._id!,
      fullName:repoData.fullName,
      phone:repoData.phone || '',
      specialization:repoData.specialization || '',
      clinicName:repoData.clinicName || '',
      createdAt:repoData.createAt!,
      updatedAt:repoData.updatedAt!,
      role:repoData.role!,
      accessToken:token||''
    }
  }

}




