import { injectable, inject } from "inversify";
import type { IUser, IAuthRepository } from "../utils/interface.utils.js";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { config } from "../config/env.config.js";
import { TYPES } from "../types/index.js";
import { CONSTANTS } from "../constants/constants.js";

@injectable()
export class AuthService {
  private _authRepo: IAuthRepository;
  constructor(@inject(TYPES.AuthRepository) authRepo: IAuthRepository) {
    this._authRepo = authRepo;
  }

  async register(user: IUser): Promise<IUser | Error> {
    const existing = await this._authRepo.findByEmail(user.email);
    if (existing) {
      throw new Error(CONSTANTS.ERRORS.USER_EXISTS);
    }
    user.password = await bcrypt.hash(user.password, 10);
    const saved = await this._authRepo.create(user);
    return saved;
  }
}
