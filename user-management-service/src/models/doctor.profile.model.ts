import mongoose, { Schema, Document } from "mongoose";
import type { IDoctorProfileDoc } from "../utils/interface.utils.js";

const DoctorProfileSchema: Schema = new Schema(
  {
    doctorId: { type: String, required: true, unique: true },
    experience: { type: String },
    address: { type: String },
    profileImageLink: { type: String },
    registration: { type: String },
    online_fee: { type: String },
    certificateLinks: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctorProfileDoc & Document>("DoctorProfile", DoctorProfileSchema);
