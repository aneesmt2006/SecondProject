
import mongoose, { Document, Schema } from "mongoose"
import type { ISymptoms } from "../utils/interface.utils.js"


const schema:Schema = new Schema({
    week:{type:Number,quired:true,unique:true},
    normalSymptoms:{type:String,required:true},
    abnormalSymptoms:{type:String,required:true}
},{
    timestamps:true
});




export default mongoose.model<ISymptoms & Document>('Symptoms',schema)