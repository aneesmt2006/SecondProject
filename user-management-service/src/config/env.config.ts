import dotenv from 'dotenv'
dotenv.config()


export const config = {
 mongoUrl:process.env.MONGO_URL,
 port:process.env.PORT,
 awsAccessKey:process.env.AWS_ACCESS_KEY_ID,
 awsSecretKey:process.env.AWS_SECRET_KEY,
 awsS3Bucket:process.env.AWS_S3_BUCKET_NAME,
 awsRegion: process.env.AWS_REGION,
 clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
 cloudinary_name:process.env.CLOUD_NAME,
 cloudinary_api_key:process.env.CLOUDINARY_API_KEY,
 cloudinary_secret_key:process.env.CLOUDINARY_API_SECRET,
}

console.log("Environment Config Loaded:", {
    awsRegion: config.awsRegion,
    awsS3Bucket: config.awsS3Bucket
});