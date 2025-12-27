import { injectable } from "inversify";
import type { IUserSymptomsRepository } from "./interfaces/IUserSymptomsRepository.js";
import type { IUserSymptoms } from "../utils/interface.utils.js";
import userSymptomsModel from "../models/user.symptoms.model.js";

@injectable()
export class UserSymptomsRepository implements IUserSymptomsRepository {
    
    async create(data: IUserSymptoms): Promise<IUserSymptoms | null> {
        return await userSymptomsModel.create(data);
    }

    async findByUserAndWeek(userId: string, week: number): Promise<IUserSymptoms | null> {
        return await userSymptomsModel.findOne({ userId, week });
    }

    async update(id: string, data: Partial<IUserSymptoms>): Promise<IUserSymptoms | null> {
        return await userSymptomsModel.findByIdAndUpdate(id, data, { new: true });
    }
}
