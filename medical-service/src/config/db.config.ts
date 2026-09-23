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
      dbName: "Medical-service",
    });
    logger.info("Connecting to MongoDB success");

    try {
      const MedicalPrescriptionModel = (await import("../models/prescription.model.js")).default;
      await MedicalPrescriptionModel.collection.dropIndex('userId_1').catch(() => {});
      await MedicalPrescriptionModel.syncIndexes().catch(() => {});
    } catch (indexErr) {
      logger.warn("Index sync warning:", indexErr);
    }
  } catch (error) {
    logger.error("Failed to connect DB", error);
    process.exit(1);
  }
};