import { injectable } from "inversify";
import userProfileModel from "../models/user.profile.model.js";
import type { IUserProfile } from "../utils/interface.utils.js";
import type { IAdminRepository } from "./interfaces/IAdminRepository.js";




@injectable()
export class AdminRepository implements IAdminRepository {
    async find(): Promise<IUserProfile[] | null> {
        return  await userProfileModel.find();
    }
}