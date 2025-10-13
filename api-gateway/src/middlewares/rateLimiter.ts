import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 1000 * 60 * 15 ,// 15 min
    max:100
})