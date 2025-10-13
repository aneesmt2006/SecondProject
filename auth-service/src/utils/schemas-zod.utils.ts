import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(5, "Full name is required"),
  email: z.string().email("Invalid Email"),
  phone: z.number(),
  password: z.string().min(8,"Password must contain at leat 8 characters"),
  role: z.enum(["user", "doctor", "admin"]),
});
