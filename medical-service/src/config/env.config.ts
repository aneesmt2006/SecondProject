import dotenv from 'dotenv'
dotenv.config()

export const config = {
 mongoUrl:process.env.MONGO_URL,
 port:process.env.PORT,
}

console.log("Environment Config Loaded (Medical Service):", {
    mongoUrlPresent: !!config.mongoUrl,
    mongoUrlStart: config.mongoUrl ? config.mongoUrl.substring(0, 15) + '...' : 'undefined'
});
