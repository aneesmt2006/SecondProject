import { injectable } from "inversify";
import UserProfileModel from "../models/user.profile.model.js";
import type { IUserProfileRepository } from "./interfaces/IUserProfileRepository.js";
import type { IUserProfile, mainData } from "../utils/interface.utils.js";
import { calculateAge } from "../utils/age.calculator.utils.js";

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

  async findByIds(userIds: string[]): Promise<IUserProfile[] | null> {
    return await UserProfileModel.find({userId:{$in:userIds}})
  }

  async findRecentUsers(recent: number): Promise<mainData[] | null> {

    const res = await UserProfileModel.find({},{fullName:1,dateOfBirth:1}).sort({createdAt:-1})
    const mapped = res.map((user)=>{
      let age = calculateAge(user.dateOfBirth!)
      return {fullName:user.fullName!,age}
    })

    return mapped
  }

  
}
