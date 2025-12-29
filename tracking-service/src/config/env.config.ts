import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  rabbitmqUrl:process.env.RABBITMQ_URL,
  medicalServiceUrl:process.env.MEDICAL_SERVICE_URL,
  usersManagementServiceUrl:process.env.USERS_MANAGEMENT_SERVICE_URL,
  appointmentServiceUrl:process.env.APPOINMENT_SERVICE_URL
};

console.log("Environment Config Loaded (Tracking Service):", {
    mongoUrlPresent: !!config.mongoUrl,
    mongoUrlStart: config.mongoUrl ? config.mongoUrl.substring(0, 15) + '...' : 'undefined'
});
