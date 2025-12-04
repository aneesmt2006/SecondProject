import mongoose from "mongoose";
import type { IUser } from "../utils/interface.utils.js";

const schema = new mongoose.Schema<IUser>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"] },
    dateOfBirth: { type: String },
    profileImage: { type: String },
    accountMethod: {
      type: String,
      enum: ["normal", "google"],
      default: "normal",
    },
   isActive:{type:Boolean,required:true,default:true}
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", schema);

// export interface pregnantProfile {
//   lmp: string;
//   isFirstPregnancy: boolean;
//   bloodGroup: string;
//   height: string;
//   weight: string;
//   gestationalDiabetes: boolean;
//   gestationalSugar: string;
//   bloodPressure: boolean;
//   bpReading: string;
//   thyroidProblems: boolean;
//   pcosPcod: boolean;
//   takingSupplements: string;
//   knownAllergies: string;
//   familyRelated: string;
//   otherHealthIssues: string;
// }
