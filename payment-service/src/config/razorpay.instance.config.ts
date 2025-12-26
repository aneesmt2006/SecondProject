import Razorpay from "razorpay";
import { config } from "./env.config.js";

export const RazorpayInstance = new Razorpay({
            key_id:config.razorpayKeyId as string,
            key_secret:config.razorpaySecret as string,
        })