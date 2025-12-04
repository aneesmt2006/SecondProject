import { inject, injectable } from "inversify";
import type { IAdminService } from "./interfaces/IAdminService.js";
import type { TUserProfileResponseDTO } from "../dtos/user.dto.js";
import { TYPES } from "../types/type.js";
import type { IAdminRepository } from "../repositories/interfaces/IAdminRepository.js";
import { ADMIN_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { calculateCurrentWeek, calculateDueDate } from "../utils/currentweek.calculation.utils.js";

@injectable()
export class AdminService implements IAdminService {
    constructor(@inject(TYPES.AdminRepository)private _adminRepo:IAdminRepository){}
    async findAllUserProfile(): Promise<{ profiles: TUserProfileResponseDTO[]; message: string; }> {
        const usersProfile = await this._adminRepo.find()

        if(!usersProfile) throw new Error(ADMIN_MESSAGES.PROFILE_FETCHING_FAILED)
        

        const mappedProfiles = usersProfile.map((profile)=>{
             let currentWeek = calculateCurrentWeek(profile.lmp!)
             let dueDate = calculateDueDate(profile.lmp!)
            const mapped = ResponseMapper.userMapping(profile,currentWeek, dueDate)
            return mapped
        })

        return {profiles:mappedProfiles,message:ADMIN_MESSAGES.PROFILE_FETCH_SUCCESS}
    }
}