import {z} from 'zod'

export const paymentInitiateSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  doctorId: z.string().min(1, "doctorId is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  appoinmentId:z.string().min(1, "appoinementId is required"),
});


export const paymentVerifySchema = z.object({
  orderCreationId: z.string().min(1, "orderCreationId is required"),
  razorpayPaymentId: z.string().min(1, "razorpayPaymentId is required"),
  razorpayOrderId: z.string().min(1, "razorpayOrderId is required"),
  razorpaySignature: z.string().min(1, "razorpaySignature is required"),
});
