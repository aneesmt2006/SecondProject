import type { Secret, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

interface Config {
  secretKey: Secret;
  expiresIn?: SignOptions['expiresIn'];
}

const configAll: Config = {
  secretKey: config.jwtSecret as Secret,
  expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
};

export const createAccessToken =  (userId: string, role: string,email:string) => {
  const options: SignOptions = {};
  if (configAll.expiresIn) {
    options.expiresIn = configAll.expiresIn;
  }

  return jwt.sign(
    { id: userId, role:role,email:email },
    configAll.secretKey,
    options
  );
};




export const createRefreshToken = (payload: string) => {
  const options: SignOptions = {};

  if (config.jwtRefreshExpiresIn !== undefined) {
    options.expiresIn = config.jwtRefreshExpiresIn as NonNullable<SignOptions['expiresIn']>;
  }

  return jwt.sign({payload}, config.jwtRefreshSecret as Secret, options);
};




export function _generateTokens(userId: string, role: string,email:string) {
     const accessToken  =  createAccessToken(userId,role,email)
     const refreshToken = createRefreshToken(userId)

    // calculation of redis EX seconds
    const redisExpireSeconds = parseExpiresToSeconds(
      config.jwtRefreshExpiresIn,
    );

    return { accessToken, refreshToken, redisExpireSeconds };
  }


   function parseExpiresToSeconds(expiresIn: string) {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24,
    };
    const match = expiresIn.match(/(\d+)([smhd])/i);
    if (!match) return 60 * 60 * 24 * 7; // 7day
    const [, value, unit] = match;
    return parseInt(value as string) * (timeUnits[unit!.toLowerCase()] || 1);
  }

