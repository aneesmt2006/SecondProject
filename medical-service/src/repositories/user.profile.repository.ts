import { injectable } from "inversify";
import UserProfileModel from "../models/user.profile.model.js";
import type { IUserProfileRepository } from "./interfaces/IUserProfileRepository.js";
import type {
  IUserProfile,
  mainData,
  onlyData,
} from "../utils/interface.utils.js";
import { calculateAge } from "../utils/age.calculator.utils.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import userProfileModel from "../models/user.profile.model.js";
import { calculateCurrentWeek } from "../utils/currentweek.calculation.utils.js";

@injectable()
export class UserProfileRepository implements IUserProfileRepository {
  async create(data: IUserProfile): Promise<IUserProfile> {
    return await UserProfileModel.create(data);
  }

  async update(
    userId: string,
    data: Partial<IUserProfile>,
  ): Promise<IUserProfile | null> {
    return await UserProfileModel.findOneAndUpdate({ userId }, data, {
      new: true,
      upsert: true,
    });
  }

  async findByUserId(userId: string): Promise<IUserProfile | null> {
    return await UserProfileModel.findOne({ userId });
  }

  async findByIds(userIds: string[]): Promise<IUserProfile[] | null> {
    return await UserProfileModel.find({ userId: { $in: userIds } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findRecentUsers(recent: number): Promise<mainData[] | null> {
    const res = await UserProfileModel.find(
      {},
      { fullName: 1, dateOfBirth: 1 },
    ).sort({ createdAt: -1 });
    const mapped = res.map((user) => {
      const age = calculateAge(user.dateOfBirth!);
      return { fullName: user.fullName || "", age };
    });
    return mapped;
  }

  async findLadiesofWeek(week: number): Promise<onlyData[]> {
    const allLadies = await UserProfileModel.find(
      {},
      { fullName: 1, primaryDoctor: 1, lmp: 1 },
    );
    const mapped = allLadies.filter(
      (user) => calculateCurrentWeek(user.lmp!) > week,
    );

    const finalMapped: onlyData[] = mapped.map((user) => ({
      fullName: user.fullName || "",
      primaryDoctor: user.primaryDoctor || "",
    }));

    return finalMapped;
  }
}
