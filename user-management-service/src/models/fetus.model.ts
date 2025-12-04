import  mongoose, {Schema } from "mongoose"
import type { IFetus } from "../utils/interface.utils.js"

const schema = new Schema<IFetus>({
    week:{type:Number,required:true,unique:true},
    fetusImage:{type:String,required:true},
    fruitImage:{type:String,required:true},
    height:{type:String,required:true},
    weight:{type:String,required:true},
    development:{type:String,required:true}
},{
    timestamps:true,
})

export default  mongoose.model("Fetus",schema)