import mongoose, { Schema, Document } from "mongoose";
import type { IUserProfile } from "../utils/interface.utils.js";

const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String },
    dateOfBirth: { type: String },
    lmp: { type: String },
    dueDate: { type: String },
    isFirstPregnancy: { type: Boolean },
    bloodGroup: { type: String },
    height: { type: String },
    weight: { type: String },
    gestationalDiabetes: { type: Boolean },
    gestationalSugar: { type: String },
    bloodPressure: { type: Boolean },
    bpReading: { type: String },
    thyroidProblems: { type: Boolean },
    pcosPcod: { type: Boolean },
    takingSupplements: { type: String },
    knownAllergies: { type: String },
    familyRelated: { type: String },
    otherHealthIssues: { type: String },
    primaryDoctor : {type:String}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserProfile & Document>("UserProfile", UserProfileSchema);
