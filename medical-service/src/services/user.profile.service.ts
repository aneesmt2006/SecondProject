import { injectable, inject } from "inversify";
import { TYPES } from "../types/type.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import type { IUserProfileService } from "./interfaces/IUserProfileService.js";
import type { TUserProfUpdateRequestDTO, TUserProfileResponseDTO } from "../dtos/user.dto.js";
import { AUTH_RESPONSE_MESSAGES, USER_PROFILE_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { calculateCurrentWeek } from "../utils/currentweek.calculation.utils.js";

@injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @inject(TYPES.UserProfileRepository) private _userProfileRepo: IUserProfileRepository
  ) {}
   // I think it is not used 
  async createProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string; }> {
    if(!userId) throw new Error(USER_PROFILE_MESSAGES.PROFILE_ID_NOT_FOUND)
    const createProfile = await this._userProfileRepo.update(userId, {...data, userId});
    if(!createProfile) throw new Error(AUTH_RESPONSE_MESSAGES.FETCH_FAILED)

      let currentWeek = calculateCurrentWeek(createProfile.lmp!)

    const mappedUser = ResponseMapper.userMapping(createProfile,currentWeek)
    return {profile:mappedUser,message:USER_PROFILE_MESSAGES.PROFILE_CREATE_SUCCESS}
  }

  async updateProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string }> {
    const updatedProfile = await this._userProfileRepo.update(userId, { ...data, userId });
    
    let currentWeek: number | undefined;
    if (updatedProfile!.lmp) {
        const lmpDate = new Date(updatedProfile!.lmp);
        if (!isNaN(lmpDate.getTime())) {
            const today = new Date();
            const diffTime = today.getTime() - lmpDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            currentWeek = Math.floor(diffDays / 7);
        }
    }

  const mappedUser = ResponseMapper.userMapping(updatedProfile!,currentWeek)
    return { profile: mappedUser, message: USER_PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS };
  }

  async getProfile(userId: string): Promise<{ profile: TUserProfileResponseDTO; message: string }> {
    const profile = await this._userProfileRepo.findByUserId(userId);
    if (!profile) {
        // Return empty data for initial render if profile doesn't exist
        return { 
            profile: { currentWeek: 0 } as TUserProfileResponseDTO, 
            message: USER_PROFILE_MESSAGES.PROFILE_GET_SUCCESS 
        };
    }

    let currentWeek: number | undefined;
    if (profile.lmp) {
        const lmpDate = new Date(profile.lmp);
        if (!isNaN(lmpDate.getTime())) {
            const today = new Date();
            const diffTime = today.getTime() - lmpDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            currentWeek = Math.floor(diffDays / 7);
        }
    }

     const mappedUser = ResponseMapper.userMapping(profile!,currentWeek)

    return { profile:mappedUser, message: USER_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
  }
}
