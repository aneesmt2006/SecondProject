import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  razorpayKeyId:process.env.RAZORPAY_KEY_ID,
  razorpaySecret:process.env.RAZORPAY_SECRET,
  rabbitmqUrl:process.env.RABBITMQ_URL
};
