import dotenv from 'dotenv';
dotenv.config();

export const config = {
  rabbitmqUrl: process.env.RABBITMQ_URL,
  mongoUrl: process.env.MONGO_URL,
};
