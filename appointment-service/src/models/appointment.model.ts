import { Schema, model } from "mongoose";
import type { IAppointment } from "../utils/interface.utils.js";

const schema = new Schema<IAppointment>(
  {
    userId: {
      type: String,
      required: true,
    },

    doctorId: {
      type: String,
      required: true,
    },

    appointmentDate: {
      type: String,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "BOOKED", "SUCCESS", "CANCELED", "CANCELLED", "EXPIRED"],
      default: "PENDING",
    },
    isRecurring:{
      type:Boolean,
      default:false
    },
    consultationStatus:{
      type:String,
      enum: ["PENDING", "COMPLETED", "CANCELED", "EXPIRED"],
      default:"PENDING"
    },
    notes: {
      type: String,
      default: ""
    },
    lockToken:{
      type:String,
      default:""
    }
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

export const AppointmentModel = model<IAppointment>("Appointment", schema);
