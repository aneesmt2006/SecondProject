import userModel from "../models/user.model.js";
import DoctorModel from "../models/dr.model.js";
import type { IUser, IDoctor } from "../utils/interface.utils.js";
import type { ITokenRepository } from "./interfaces/ITokenRepository.js";
import { injectable } from "inversify";

@injectable()
export class TokenRepository implements ITokenRepository {
  async findUserById(id: string): Promise<IUser | null> {
    return await userModel.findById(id);
  }

  async findDoctorById(id: string): Promise<IDoctor | null> {
    return await DoctorModel.findById(id);
  }
}
