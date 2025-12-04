import { injectable } from "inversify";
import type { IUser } from "../utils/interface.utils.js";
import UserModel from "../models/user.model.js";
import type { IAuthRepository } from "./interfaces/IAuthRepository.js";

@injectable()
export class AuthRepository implements IAuthRepository {
  async create(user: IUser): Promise<IUser> {
    console.log("from auth data", user);

    const User = new UserModel(user);
    const savedDoc = await User.save();
    return savedDoc;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const savedDoc = await UserModel.findOne({ email });
    return savedDoc;
  }

  async findById(id: string): Promise<IUser | null> {
    console.log("ID....",id)
     const doc =  await UserModel.findById(id);
     return doc
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    //  const doc = await UserModel.findByIdAndUpdate({_id:id},{$set:{profile:user}})
    const doc = await UserModel.findByIdAndUpdate(id,user)
     console.log("FROM REPO",doc)
      return doc
  }
}
