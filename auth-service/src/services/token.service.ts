import { injectable, inject } from "inversify";
import { TYPES } from "../types/index.js";
import type { ITokenService } from "./interfaces/ITokenService.js";
import type { ITokenRepository } from "../repositories/interfaces/ITokenRepository.js";
import { CONSTANTS } from "../constants/constants.js";
import { AUTH_RESPONSE_MESSAGES } from "../constants/response-messages.constant.js";
import { redisClient } from "../config/redis.config.js";
import jwt, { type Secret } from "jsonwebtoken";
import { config } from "../config/env.config.js";
import { _generateTokens } from "../utils/jwt.utils.js";

@injectable()
export class TokenService implements ITokenService {
  private _tokenRepo: ITokenRepository;

  constructor(@inject(TYPES.TokenRepository) tokenRepo: ITokenRepository) {
    this._tokenRepo = tokenRepo;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; message: string }> {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as Secret) as { id?: string, role?: string };

    const userId = decoded.id;
    if (!userId) {
      throw new Error(CONSTANTS.ERRORS.INVALID_REFRESH_TOKEN);
    }

    console.log("Refresh token decoded data-----> ", decoded);

    const storedToken = await redisClient.get(`refresh:${userId}`);
    console.log("STORED TOKEN===============>", storedToken);

    if (storedToken !== refreshToken) {
      throw new Error(CONSTANTS.ERRORS.INVALID_REFRESH_TOKEN);
    }

    const userRole = decoded.role || 'user';
    let user;
    if (userRole === 'doctor') {
      user = await this._tokenRepo.findDoctorById(userId);
    } else {
      user = await this._tokenRepo.findUserById(userId);
    }
    
    if (!user) throw new Error(CONSTANTS.ERRORS.USER_NOT_FOUND);

    const { accessToken } = _generateTokens(user._id!.toString(), user.role, user.email);
    // await redisClient.set(`refresh:${user._id}`, newRefreshToken, { EX: redisExpireSeconds });
    return { accessToken, message: AUTH_RESPONSE_MESSAGES.REFRESH_TOKEN_SUCCCESS };
  }
}
