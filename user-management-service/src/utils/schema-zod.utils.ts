import {z} from 'zod'
export const drUpdateSchema = z.object({
  fullName: z.string().min(3, "Full name is required").optional(),
  phone: z.string().min(10, "Enter proper contact number").optional(),
  role: z.enum(["doctor", "admin", "user"]).optional(),
  specialization: z.string().optional(),
  clinicName: z.string().min(1, "Clinic/Hospital name is required").optional(),
  experience: z.string().min(1, "Experience is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  profileImageLink: z.string().nullable().optional(),
  registration: z.string().min(1, "Registration No. is required").optional(),
  online_fee: z.string().min(1, "Online fee is required").optional(),
  certificateLinks: z.array(z.string()).optional(),
});

export const fetusSchema = z.object({
    week:z.number().min(1,"Week is required"),
    fetusImage:z.string().min(1,"Image is required"),
    fruitImage:z.string().min(1,"fruit image is required"),
    weight:z.string().min(1),
    height:z.string().min(1),
    development:z.string().min(1),
});


