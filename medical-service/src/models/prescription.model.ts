import mongoose, { Schema } from "mongoose";
import type { IMedicalPrescription } from "../utils/interface.utils.js";

const PrescriptionSchema = new Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    doctorName: { type: String },
    content: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IMedicalPrescription>(
  "MedicalPrescription",
  PrescriptionSchema,
);
