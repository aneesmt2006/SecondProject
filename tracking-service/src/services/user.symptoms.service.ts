import { inject, injectable } from "inversify";
import { TYPES } from "../types/type.js";
import type { IUserSymptomsService } from "./interfaces/IUserSymptomsService.js";
import type { IUserSymptomsRepository } from "../repositories/interfaces/IUserSymptomsRepository.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import type { IUserDet, IUserSymptoms } from "../utils/interface.utils.js";
import { publishEvent } from "../config/rabbitmq.config.js";
import axios from "axios";
import { config } from "../config/env.config.js";
import type { ApiResponse } from "../utils/api.response.utils.js";

@injectable()
export class UserSymptomsService implements IUserSymptomsService {
    constructor(
        @inject(TYPES.UserSymptomsRepository) private _userSymptomsRepo: IUserSymptomsRepository,
        @inject(TYPES.SymptomsRepository) private _symptomsRepo: ISymptomsRepository
    ) {}

    /**
     * Logs symptoms for a user for a specific week and handles abnormality events
     * @param data - Object containing week, selected symptoms, and userId
     * @returns Logged symptoms data + success message
     */
    async logSymptoms(data: { week: number, selectedNormalSymptoms: string[], selectedAbnormalSymptoms: string[], userId: string }): Promise<{ message: string, data: IUserSymptoms }> {
        const { week, selectedNormalSymptoms, selectedAbnormalSymptoms, userId } = data;

        console.log("From service what happened to me--->")

        // 1. Fetch master symptoms for the week
        const masterSymptoms = await this._symptomsRepo.findByWeek(week);
        if (!masterSymptoms) {
            throw new Error(`Symptoms configuration for week ${week} not found.`);
        }

        // 2. Validate Normal Symptoms
        const invalidNormal = selectedNormalSymptoms.filter(s => !masterSymptoms.normalSymptoms.includes(s));
        if (invalidNormal.length > 0) {
            throw new Error(`Invalid normal symptoms selected: ${invalidNormal.join(", ")}`);
        }

        // 3. Validate Abnormal Symptoms
        const invalidAbnormal = selectedAbnormalSymptoms.filter(s => !masterSymptoms.abnormalSymptoms.includes(s));
        if (invalidAbnormal.length > 0) {
            throw new Error(`Invalid abnormal symptoms selected: ${invalidAbnormal.join(", ")}`);
        }


       const abnormal = selectedAbnormalSymptoms.filter((sympt)=>masterSymptoms.abnormalSymptoms.includes(sympt))
       let userDetResposne;
       let mainDoctorResponse
       console.log(`${config.medicalServiceUrl}/patient/profile/forDoctors`)
       console.log(`${config.appointmentServiceUrl}/booking/user/main-doctor`)
       try {
         userDetResposne =  await axios.post<ApiResponse<IUserDet[]>>(`${config.medicalServiceUrl}/patient/profile/forDoctors`,[userId])
        mainDoctorResponse = await axios.get<ApiResponse<string>>(`${config.appointmentServiceUrl}/booking/user/main-doctor`,{
            headers:{
                'x-token-id': userId
            }
        })
       } catch (error) {
         console.log("Error while communicate to service-service medical / user-management",error)
         throw new Error("Some issue found")
       }
       const doctorId = mainDoctorResponse.data.data
       const userDet = userDetResposne.data.data
       console.log("DOctor id from tracking-->",doctorId)
       console.log("User detials from tracking-->",userDet)

       if(abnormal){
            publishEvent('tracking.abnormality',{
                pattern:'tracking.abnormality',
                data:{
                    userId:userDet[0]?.userId,
                    fullName:userDet[0]?.fullName,
                    age:userDet[0]?.age,
                    week:userDet[0]?.week,
                    trimester:userDet[0]?.trimester,
                    isFirstPregnancy:userDet[0]?.isFirstPregnancy,
                    abnormalSymptoms:abnormal,
                    doctorId:doctorId
                }
            })
        }

        // 4. Check if user already logged for this week (Upsert logic)
        // Check existing
        let existing = await this._userSymptomsRepo.findByUserAndWeek(userId, week);
        
        // Prepare data
        const symptomsData: IUserSymptoms = {
            userId,
            week,
            selectedNormalSymptoms,
            selectedAbnormalSymptoms
        };


         

        if (existing) {
            // Update
             // @ts-ignore - _id presence is guaranteed
            const updated = await this._userSymptomsRepo.update(existing._id!, symptomsData);
            if(!updated) throw new Error("Failed to update symptoms");
            return { message: "Symptoms updated successfully", data: updated };
        } else {
            // Create
            const created = await this._userSymptomsRepo.create(symptomsData);
            if(!created) throw new Error("Failed to log symptoms");
            return { message: "Symptoms logged successfully", data: created };
        }
    }
}
