import { injectable, inject } from "inversify";
import { TYPES } from "../types/type.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import type { IUserProfileService } from "./interfaces/IUserProfileService.js";
import type { PatientDTO, TUserIdsDTO, TUserProfUpdateRequestDTO, TUserProfileResponseDTO, TUsersDetDTO } from "../dtos/user.dto.js";
import { AUTH_RESPONSE_MESSAGES, USER_PROFILE_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { calculateCurrentWeek, calculateDueDate } from "../utils/currentweek.calculation.utils.js";
import { calculateAge } from "../utils/age.calculator.utils.js";
import { getTrimesterByWeek } from "../utils/trimester.calculator.utils.js";
import { calculatePregnancyProgress, getBloodPressureStatus, getBloodSugarStatus } from "../utils/health.check.utils.js";

@injectable()
export class UserProfileService implements IUserProfileService {
  constructor(
    @inject(TYPES.UserProfileRepository) private _userProfileRepo: IUserProfileRepository
  ) {}
  /**
   * Creates or updates a user profile
   * @param userId - User ID
   * @param data - Profile update data
   * @returns Created/Updated profile + success message
   */
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

  /**
   * Updates an existing user profile
   * @param userId - User ID
   * @param data - Profile update data
   * @returns Updated profile + success message
   */
  async updateProfile(userId: string, data: TUserProfUpdateRequestDTO): Promise<{ profile: TUserProfileResponseDTO; message: string }> {
    if (data.lmp) {
      data.dueDate = calculateDueDate(data.lmp);
    }
    
    const updatedProfile = await this._userProfileRepo.update(userId, { ...data, userId });
    
    const currentWeek = updatedProfile!.lmp ? calculateCurrentWeek(updatedProfile!.lmp) : 0;
    const mappedUser = ResponseMapper.userMapping(updatedProfile!, currentWeek, updatedProfile!.dueDate);
    return { profile: mappedUser, message: USER_PROFILE_MESSAGES.PROFILE_UPDATE_SUCCESS };
  }

  /**
   * Retrieves a user profile details
   * @param userId - User ID
   * @returns User profile + success message
   */
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

  /**
   * Retrieves profiles for multiple patients
   * @param userIds - DTO with list of user IDs
   * @returns List of patient profiles + success message
   */
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



  /**
   * Retrieves comprehensive medical record for a patient
   * @param userId - Patient User ID
   * @returns Medical record DTO + success message
   */
  async getPatientMedicalRecord(userId: string): Promise<{ medicalRecord: PatientDTO; message: string; }> {
    const patientData = await this._userProfileRepo.findByUserId(userId);
    if (!patientData) {
        throw new Error(AUTH_RESPONSE_MESSAGES.FETCH_FAILED); 
    }

    const currentWeek = patientData.lmp ? calculateCurrentWeek(patientData.lmp) : 0;
    const progress = calculatePregnancyProgress(currentWeek);
    const trimester = getTrimesterByWeek(currentWeek);
    const age = patientData.dateOfBirth ? calculateAge(patientData.dateOfBirth) : 0;
    
    // Dummy Data for Missing Fields
    const babyHeartRate = 145; 
    
    const medicalRecord: PatientDTO = {
        name: patientData.fullName || "Unknown",
        age: age,
        gender: "Female",
        id: patientData.userId, 
        status: "In-Patient", 
        height: patientData.height || "N/A",
        weight: patientData.weight || "N/A",
        bloodType: patientData.bloodGroup || "N/A",
        allergies: patientData.knownAllergies || "None",
        pregnancy: {
            week: currentWeek,
            trimester: trimester,
            dueDate: patientData.dueDate || "",
            progress: progress
        },
        vitals: [
            {
                id: 1,
                label: "Blood Pressure",
                value: patientData.bpReading ? `${patientData.bpReading} ` : "N/A",
                unit: "mmHg",
                status: getBloodPressureStatus(patientData.bpReading),
                color: getBloodPressureStatus(patientData.bpReading) === 'Normal' ? "success" : "danger",
                date: (patientData.updatedAt ? new Date(patientData.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) || "",
                desc: "Regular, healthy range" 
            },
            {
                id: 2,
                label: "Blood Sugar",
                value: patientData.gestationalSugar ? `${patientData.gestationalSugar}` : "N/A",
                unit: "mg/dL",
                status: getBloodSugarStatus(patientData.gestationalSugar),
                color: getBloodSugarStatus(patientData.gestationalSugar) === 'Normal' ? "success" : "danger",
                date: (patientData.updatedAt ? new Date(patientData.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) || "",
                desc: "Fasting, within normal limits" 
            },
             {
                id: 3,
                label: "Baby Heart Rate",
                value: `${babyHeartRate}`,
                unit: "bpm",
                status: "Normal",
                color: "success",
                date: (new Date().toISOString().split('T')[0]) || "", 
                desc: "Strong and consistent"
            },
            {
                id: 4,
                label: "Weight",
                value: patientData.weight ? `${patientData.weight}` : "N/A",
                unit: "kg",
                status: "Normal", 
                color: "success",
                date: (patientData.updatedAt ? new Date(patientData.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) || "",
                desc: "Stable, healthy gain"
            }
        ],
        abnormalities: "Mild ankle swelling noted in evenings. No other concerns.", 
        lastPrescription: {
            doctor: "Dr. Sarah Jenkins",
             date: "DEC 20, 2025",
             medication: "Prenatal Vitamins, Iron Supplements"
        },
        lastReport: {
             name: "3rd Trimester Ultrasound",
             date: "Dec 18, 2025",
             status: "Normal"
        }
    };

    return { medicalRecord, message: USER_PROFILE_MESSAGES.PROFILE_GET_SUCCESS };

  }
}
