import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port:process.env.PORT || 3000,
    logLevel:process.env.LOG_LEVEL,
    service:process.env.SERVICE,
    usersManagementServiceUrl:process.env.USERS_MANAGEMENT_SERVICE_URL,
    authServiceUrl:process.env.AUTH_SERVICE_URL,
    medicalServiceUrl:process.env.MEDICAL_SERVICE_URL,
    // other urls
    jwtSecret:process.env.JWT_SECRET || "your-secret-key",
    deploy:process.env.DEPLOY

} 


