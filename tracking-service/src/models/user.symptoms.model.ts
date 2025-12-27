
import mongoose, { Document, Schema } from "mongoose";
import type { IUserSymptoms } from "../utils/interface.utils.js";

const schema = new Schema({
  userId: { type: String, required: true },
  week: { type: Number, required: true },
  selectedNormalSymptoms: [{ type: String }],
  selectedAbnormalSymptoms: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IUserSymptoms & Document>('UserSymptoms', schema);
