import nodemailer from "nodemailer";
import { config } from "./env.config.js";

export const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: config.userMail,
    pass: config.passwordMail,
  },
});
