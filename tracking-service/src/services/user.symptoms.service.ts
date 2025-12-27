import { inject, injectable } from "inversify";
import { TYPES } from "../types/type.js";
import type { IUserSymptomsService } from "./interfaces/IUserSymptomsService.js";
import type { IUserSymptomsRepository } from "../repositories/interfaces/IUserSymptomsRepository.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import type { IUserSymptoms } from "../utils/interface.utils.js";

@injectable()
export class UserSymptomsService implements IUserSymptomsService {
    constructor(
        @inject(TYPES.UserSymptomsRepository) private _userSymptomsRepo: IUserSymptomsRepository,
        @inject(TYPES.SymptomsRepository) private _symptomsRepo: ISymptomsRepository
    ) {}

    async logSymptoms(data: { week: number, selectedNormalSymptoms: string[], selectedAbnormalSymptoms: string[], userId: string }): Promise<{ message: string, data: IUserSymptoms }> {
        const { week, selectedNormalSymptoms, selectedAbnormalSymptoms, userId } = data;

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


        if()

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
