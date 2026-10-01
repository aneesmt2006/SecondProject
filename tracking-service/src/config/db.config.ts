import logger from "../utils/logger.js";
import mongoose from "mongoose";
import { config } from "./env.config.js";

export const connectDB = async () => {
  const url = config.mongoUrl;
  try {
    if (!url) {
      throw new Error("DB url is Missing");
    }

    await mongoose.connect(url, {
      dbName: "Tracking-service",
    });
    logger.info("Connecting to MongoDB success");
  } catch (error) {
    logger.error("Failed to connect DB", error);
    process.exit(1);
  }
};
