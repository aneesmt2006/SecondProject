import mongoose, { Schema } from "mongoose";
import type { IDoctorSlotDoc } from "../utils/interface.utils.js";
import { required } from "zod/mini";

const DaySchema = new Schema({
  enabled: { type: Boolean, default: false },
  start: { type: String },
  end: { type: String },
  breaks: [
    {
      start: String,
      end: String
    }
  ]
}, { _id: false });

const DoctorSlotRuleSchema = new Schema({
  doctorId: { type: String, required: true, unique: true },

  schedule: {
    Monday: { type: DaySchema, required: true },
    Tuesday: { type: DaySchema, required: true },
    Wednesday: { type: DaySchema, required: true },
    Thursday: { type: DaySchema, required: true },
    Friday: { type: DaySchema, required: true },
    Saturday: { type: DaySchema, required: true },
    Sunday: { type: DaySchema, required: true }
  },

  slotDuration: { type: String, required: true },
  unavailableDates:{ type:[String] ,required:false}

}, { timestamps: true });



export default mongoose.model<IDoctorSlotDoc & Document>("DoctorSlot", DoctorSlotRuleSchema);
