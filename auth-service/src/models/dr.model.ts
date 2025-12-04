import mongoose from "mongoose";
import type { IDoctor } from "../utils/interface.utils.js";

const schema = new mongoose.Schema<IDoctor>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    clinicName: { type: String, required: true },
    specialization: { type: String, required: true },

    role: { type: String, enum: ["doctor", "admin"] },
    accountMethod: {
      type: String,
      enum: ["normal", "google"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "blocked"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IDoctor>("Doctor", schema);
