import { injectable, inject } from "inversify";
import { TYPES } from "../types/type.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import type { IUserProfileService } from "./interfaces/IUserProfileService.js";
import type { TUserIdsDTO, TUserProfUpdateRequestDTO, TUserProfileResponseDTO, TUsersDetDTO } from "../dtos/user.dto.js";
import { AUTH_RESPONSE_MESSAGES, USER_PROFILE_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { calculateCurrentWeek, calculateDueDate } from "../utils/currentweek.calculation.utils.js";
import { calculateAge } from "../utils/age.calculator.utils.js";
import { getTrimesterByWeek } from "../utils/trimester.calculator.utils.js";

@injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @inject(TYPES.UserProfileRepository) private _userProfileRepo: IUserProfileRepository
  ) {}
   // I think it is not used 
  async createProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string; }> {
    if(!userId) throw new Error(USER_PROFILE_MESSAGES.PROFILE_ID_NOT_FOUND)
    
    if (data.lmp) {
      data.dueDate = calculateDueDate(data.lmp);
    }

    const createProfile = await this._userProfileRepo.update(userId, {...data, userId});
    if(!createProfile) throw new Error(AUTH_RESPONSE_MESSAGES.FETCH_FAILED)

    const currentWeek = createProfile.lmp ? calculateCurrentWeek(createProfile.lmp) : 0;
    const mappedUser = ResponseMapper.userMapping(createProfile, currentWeek, createProfile.dueDate);
    return {profile:mappedUser,message:USER_PROFILE_MESSAGES.PROFILE_CREATE_SUCCESS}
  }

  async updateProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string }> {
    if (data.lmp) {
      data.dueDate = calculateDueDate(data.lmp);
    }
    
    const updatedProfile = await this._userProfileRepo.update(userId, { ...data, userId });
    
    const currentWeek = updatedProfile!.lmp ? calculateCurrentWeek(updatedProfile!.lmp) : 0;
    const mappedUser = ResponseMapper.userMapping(updatedProfile!, currentWeek, updatedProfile!.dueDate);
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

    const currentWeek = profile.lmp ? calculateCurrentWeek(profile.lmp) : 0;
    const mappedUser = ResponseMapper.userMapping(profile, currentWeek, profile.dueDate);

    return { profile:mappedUser, message: USER_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
  }

  async  getPatientsProfile(userIds:TUserIdsDTO):Promise<{profiles:TUsersDetDTO[],message:string}> {
    const patientsDoc = await this._userProfileRepo.findByIds(userIds)
    if(!patientsDoc){
      throw new Error(AUTH_RESPONSE_MESSAGES.FETCH_FAILED)
    }

    const mappedPatients = patientsDoc.map((patient)=>{
      let currentWeek = calculateCurrentWeek(patient.lmp!)
      let age = calculateAge(patient.dateOfBirth!)
      let trimeter = getTrimesterByWeek(currentWeek)
      const data = ResponseMapper.userPatientMapping(patient,currentWeek,age,trimeter)

      return data
    })

    return {profiles:mappedPatients,message:USER_PROFILE_MESSAGES.PROFILE_GET_SUCCESS}
  }
}
