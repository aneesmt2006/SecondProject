import mongoose, { Schema } from "mongoose";
import type { IPaymentOrder } from "../utils/interface.utils.js";

const schema = new Schema<IPaymentOrder>(
  {
    tempOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
    },

    userId: {
      type: String,
      required: true,
    },

    doctorId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    appoinmentId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },

    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentOrderModel = mongoose.model("PaymentOrder", schema);
