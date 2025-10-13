import mongoose from "mongoose";
import type { IUser } from "../utils/interface.utils.js";

const schema = new mongoose.Schema<IUser>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "doctor", "admin"] },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User",schema);
