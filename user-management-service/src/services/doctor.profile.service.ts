import { injectable, inject } from "inversify";
import { TYPES } from "../types/type.js";
import type { IDoctorProfileRepository } from "../repositories/interfaces/IDoctorProfileRepository.js";
import type { IDoctorProfileService } from "./interfaces/IDoctorProfileService.js";
import type { TDoctorProfileUpdateRequestDTO, TDoctorProfileResponseDTO, TDoctorApmntDetDTO } from "../dtos/doctor.dto.js";
import { DOCTOR_PROFILE_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";


@injectable()
export class DoctorProfileService implements IDoctorProfileService {
  constructor(
    @inject(TYPES.DoctorProfileRepository) private _doctorProfileRepo: IDoctorProfileRepository
  ) {}

  /**
   * Updates doctor profile details
   * @param doctorId - Doctor ID
   * @param data - Update data DTO
   * @returns Updated profile + success message
   */
  async updateProfile(doctorId: string, data: TDoctorProfileUpdateRequestDTO): Promise<{ profile: TDoctorProfileResponseDTO; message: string }> {
    if(!doctorId) throw new Error(DOCTOR_PROFILE_MESSAGES.DOCTOR_ID_MISSING)
    const updatedProfile = await this._doctorProfileRepo.update(doctorId,{ ...data, doctorId });
   const mappedDoctor = ResponseMapper.doctorMapping(updatedProfile!)
 
    return { profile: mappedDoctor, message: DOCTOR_PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS };
  }

  /**
   * Fetches doctors filtered by specialization category with pagination
   * @param specialization - Specialization string
   * @param page - Page number
   * @param limit - Items per page
   * @returns List of doctor profiles, page count + success message
   */
  async getDoctorsByCategory(specialization: string, page: number, limit: number): Promise<{ profiles: TDoctorProfileResponseDTO[];pageCounts:number, message: string }> {
      const queuery:Record<string, any>= {}
      if(specialization)queuery.specialization = specialization 
      const {profiles,pageCounts} = await this._doctorProfileRepo.findByCategory(queuery, page, limit);

     
      const mappedProfiles = profiles.map(doc => ResponseMapper.doctorMapping(doc));
    
      return { profiles:mappedProfiles,pageCounts,message: DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
  }

  /**
   * Retrieves a doctor's profile
   * @param doctorId - Doctor ID
   * @returns Doctor profile + success message
   */
  async getProfile(doctorId: string): Promise<{ profile: TDoctorProfileResponseDTO; message: string }> {
    const profile = await this._doctorProfileRepo.findByDoctorId(doctorId);
    if (!profile) {
        // Return default profile if not found
        const defaultProfile: TDoctorProfileResponseDTO = {
            doctorId: doctorId,
        };
        return { profile: defaultProfile, message: DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
    }
     const mappedDoctor = ResponseMapper.doctorMapping(profile!)
    return { profile: mappedDoctor, message: DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS};
  }

  /**
   * Retrieves all doctor profiles
   * @returns List of all doctor profiles + success message
   */
  async getAllDoctors(): Promise<{ profiles: TDoctorProfileResponseDTO[]; message: string }> {
    const profiles = await this._doctorProfileRepo.findAll();
    const mappedProfiles = profiles.map(profile => ResponseMapper.doctorMapping(profile));
    return { profiles: mappedProfiles, message: DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
  }




  /**
   * Retrieves appointment details for all doctors (internal use likely)
   * @returns List of doctor appointment details + success message
   */
  async getAllDoctorsApmntDet(): Promise<{ doctorsApmnt: TDoctorApmntDetDTO[]; message: string; }> {
    const activeDoctorsDoc = await this._doctorProfileRepo.findAll()

    const mappedApmntDet  = activeDoctorsDoc.map((ampnt)=>ResponseMapper.doctorApmntDetMapping(ampnt))

    return {doctorsApmnt:mappedApmntDet,message:DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS}
  }

  /**
   * Retrieves profiles for a list of doctor IDs
   * @param doctorIds - Array of doctor IDs
   * @returns List of doctor profiles + success message
   */
  async getProfilesForAppointments(doctorIds: string[]): Promise<{ profiles: TDoctorProfileResponseDTO[]; message: string; }> {
    const profiles = await this._doctorProfileRepo.findDoctorsByIds(doctorIds);
    const mappedProfiles = profiles.map(profile => ResponseMapper.doctorMapping(profile));
    return { profiles: mappedProfiles, message: DOCTOR_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };
  }
}
