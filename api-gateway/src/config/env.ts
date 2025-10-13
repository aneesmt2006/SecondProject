import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port:process.env.PORT || 3000,
    logLevel:process.env.LOG_LEVEL,
    service:process.env.SERVICE,
    userServiceUrl:process.env.USER_SERVICE_URL,
    // other urls
    jwtSecret:process.env.JWT_SECRET || "your-secret-key"

} 


