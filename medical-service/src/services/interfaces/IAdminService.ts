import type { TUserProfileResponseDTO } from "../../dtos/user.dto.js";

export interface IAdminService {
    findAllUserProfile():Promise<{profiles:TUserProfileResponseDTO[],message:string}>
}