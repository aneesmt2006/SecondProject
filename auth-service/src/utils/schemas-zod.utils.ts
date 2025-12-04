import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid Email"),
  phone: z.string().min(10, "Enter proper Contact number"),
  password: z.string().min(8, "Password must contain at leat 8 characters"),
  dateOfBirth: z.string(),
  role: z.enum(["user", "doctor", "admin"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  email: z.string().email("Invalid Email"),
});





export const resendOtpSchema = z.object({
  email: z.string().email("Ivalid email"),
});

export const drRegisterSchema = z.object({
  fullName: z.string().min(3, "Full name is required!at leat 3 characters"),
  email: z.string().email("Email is required"),
  phone: z.string().min(10, "Enter proper contact number"),
  role: z.string().min(5, "Role is required"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  specialization: z.string(),
  clinicName: z.string(),
});


