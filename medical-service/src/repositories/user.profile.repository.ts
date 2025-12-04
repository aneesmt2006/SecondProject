import { injectable } from "inversify";
import UserProfileModel from "../models/user.profile.model.js";
import type { IUserProfileRepository } from "./interfaces/IUserProfileRepository.js";
import type { IUserProfile } from "../utils/interface.utils.js";

@injectable()
export class UserProfileRepository implements IUserProfileRepository {
  async create(data: IUserProfile):Promise<IUserProfile> {
    return await UserProfileModel.create(data);
  }

  async update(userId: string, data: Partial<IUserProfile>): Promise<IUserProfile | null> {
    return await UserProfileModel.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
  }

  async findByUserId(userId: string): Promise<IUserProfile | null> {
    return await UserProfileModel.findOne({ userId });
  }
}
