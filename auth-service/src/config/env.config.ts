  import dotenv from "dotenv";

  dotenv.config();

  export const config = {
    port: process.env.PORT || 3001,
    mongoUrl: process.env.MONGO_URL,
    nodeEnv: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    jwtRefreshSecret:process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn:process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    userMail: process.env.USER_MAIL,
    passwordMail: process.env.PASSWORD_MAIL,
    otpExpiry: process.env.OTP_EXPIRY,
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    accessToken_maxAge:process.env.ACCESS_MAX_AGE || 1000 * 60 * 60 * 24,
    refreshToken_maxAge:process.env.REFRESH_MAX_AGE || 1000 * 60 * 60 * 24 * 30,
    goole_client_id:process.env.GOOGLE_CLIENT_ID,
    google_secret_id:process.env.GOOGLE_SECRET_ID,
    AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    AWSSecretKey: process.env.AWS_SECRET_KEY,
    AWSBucketName: process.env.AWS_S3_BUCKET_NAME,
    AWSRegion: "eu-north-1",
  };
