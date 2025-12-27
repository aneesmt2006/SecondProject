
import mongoose, { Document, Schema } from "mongoose"
import type { ISymptoms } from "../utils/interface.utils.js"


const schema = new Schema({
  week: { type:Number, required:true, unique:true },

  normalSymptomsHTML: { type:String },    // for UI render
  abnormalSymptomsHTML: { type:String },

  normalSymptoms: [{ type:String }],      // parsed from HTML
  abnormalSymptoms: [{ type:String }],

}, { timestamps:true });




export default mongoose.model<ISymptoms & Document>('Symptoms',schema)