import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  userMail: process.env.USER_MAIL,
  passwordMail: process.env.PASSWORD_MAIL,
  redisUrl: process.env.REDIS_URL,
};
