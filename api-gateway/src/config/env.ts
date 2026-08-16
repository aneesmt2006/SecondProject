import dotenv from 'dotenv';
dotenv.config();

// Throws at startup if a required env var is missing
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  service: process.env.SERVICE || 'api-gateway',
  usersManagementServiceUrl: requireEnv('USERS_MANAGEMENT_SERVICE_URL'),
  authServiceUrl: requireEnv('AUTH_SERVICE_URL'),
  medicalServiceUrl: requireEnv('MEDICAL_SERVICE_URL'),
  appointmentServiceUrl: requireEnv('APPOINTMENT_SERVICE_URL'),
  paymentServiceUrl: requireEnv('PAYMENT_SERVICE_URL'),
  trackingServiceUrl: requireEnv('TRACKING_SERVICE_URL'),
  communicationServiceUrl: requireEnv('COMMUNICATION_SERVICE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  redisUrl: requireEnv('REDIS_URL'),
  frontEndUrl: process.env.FRONT_END_URL || '',
  frontEndUrl2: process.env.FRONT_END_URL2 || '',
  deploy: process.env.DEPLOY || 'development',
};
