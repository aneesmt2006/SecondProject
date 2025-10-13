import mongoose from "mongoose";
import { config } from "./env.config.js";

export const connectDB = async () => {
  const url = config.mongoUrl;
  try {
    if (!url) {
      throw new Error("DB url is Missing");
    }

    await mongoose.connect(url, {
      dbName: "User-Service",
    });
    console.log("Connecting to MongoDB success");
  } catch (error) {
    console.error("Failed to connect DB", error);
    process.exit(1);
  }
};
