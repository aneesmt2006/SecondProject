import mongoose from "mongoose";
import { config } from "./env.config.js";
import logger from "../utils/logger.js";

// Top-level await: Stops app startup until MongoDB connects.
await mongoose.connect(config.mongoUrl, {
  dbName: "Appointment-Service",
});
logger.info("MongoDB connected successfully (appointment-service)");

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { error: err.message });
});