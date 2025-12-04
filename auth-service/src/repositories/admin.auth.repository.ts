import userModel from "../models/user.model.js";
import  DoctorModel from '../models/dr.model.js'
import type { IDoctor, IUser } from "../utils/interface.utils.js";
import type { IAdminAuthRepository } from "./interfaces/IAdminRepository.js";
import { injectable } from "inversify";

@injectable()
export class AdminAuthRepository implements IAdminAuthRepository{

    
    async findByEmail(email: string): Promise<IUser | null> {
         const data = await userModel.findOne({email});
         return data
     }

     async findUsers(): Promise<IUser[] | null> {
         return await userModel.find({role:"user"});
     }

     async findDoctors(): Promise<IDoctor[] | null> {
        return await DoctorModel.find({role:"doctor"});
    }

    async updateDoctorStatus(id: string, status: string): Promise<IDoctor | null> {
        console.log("Iddd",id,'status',status)
        const response =  await DoctorModel.findByIdAndUpdate(id,{$set:{status}},{new:true})
        console.log("RESSSPONSE ---------->",response)
        return response
    }


    async updateUserStatus(id: string, status: boolean): Promise<IUser | null> {
        console.log("Iddd",id,'status',status)
        const response =  await userModel.findByIdAndUpdate(id,{$set:{isActive:status}},{new:true})
        console.log("RESSSPONSE ---------->",response)
        return response
    }
}