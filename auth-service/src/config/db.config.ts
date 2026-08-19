import mongoose from "mongoose";
import { config } from "./env.config.js";

import logger from "../utils/logger.js";

const url = config.mongoUrl;
if (!url) {
  throw new Error("DB url is Missing");
}

await mongoose.connect(url, {
  dbName: "User-Service",
});
logger.info("MongoDB connected successfully (auth-service)");

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { error: err.message });
});
