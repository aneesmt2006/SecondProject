import type { TUserIdsDTO, TUserProfUpdateRequestDTO, TUserProfileResponseDTO, TUsersDetDTO } from "../../dtos/user.dto.js";

export interface IUserProfileService {
  createProfile(userId:string,data:TUserProfUpdateRequestDTO):Promise<{profile:TUserProfileResponseDTO,message:string}>
  updateProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string }>;
  getProfile(userId: string): Promise<{ profile: TUserProfileResponseDTO; message: string }>;
  getPatientsProfile(userIds:TUserIdsDTO):Promise<{profiles:TUsersDetDTO[],message:string}>

}
