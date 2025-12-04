import dotenv from 'dotenv'
dotenv.config()

export const config = {
 mongoUrl:process.env.MONGO_URL,
 port:process.env.PORT,
}
