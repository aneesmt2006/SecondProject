import { injectable } from "inversify";
import type { IUser, IAuthRepository } from "../utils/interface.utils.js";
import UserModel from "../models/user.model.js";

@injectable()
export class AuthRepository implements IAuthRepository {
  async create(user: IUser): Promise<IUser> {
    try {
      const User = new UserModel(user);
      return await User.save();
    } catch (error) {
      console.error("Error at AuthRepository", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }
}
