import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  frontEndUrl: process.env.FRONTEND_URL,
};
