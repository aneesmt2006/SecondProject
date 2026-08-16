import dotenv from 'dotenv';
dotenv.config();

/**
 * Validate that a required environment variable is present.
 * Throws at startup if any required var is missing.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 3004,
  mongoUrl: requireEnv('MONGO_URL'),
  rabbitmqUrl: requireEnv('RABBITMQ_URL'),
  medicalServiceUrl: requireEnv('MEDICAL_SERVICE_URL'),
  usersManagementServiceUrl: requireEnv('USERS_MANAGEMENT_SERVICE_URL'),
  redisUrl: requireEnv('REDIS_URL'),
  slotLockTTL: process.env.SLOT_LOCK_TTL || '900', // Default 15 mins
  deploy: process.env.DEPLOY || 'development',
  service: process.env.SERVICE || 'appointment-service',
};