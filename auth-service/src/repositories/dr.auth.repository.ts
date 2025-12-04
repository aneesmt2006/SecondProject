import type { IDoctor } from "../utils/interface.utils.js";
import type { IDrAuthRepository } from "./interfaces/IDrAuthRepository.js";
import  DoctorModel from '../models/dr.model.js'



export class  DrAuthRepository implements IDrAuthRepository{
 
    async create(doctorData: IDoctor): Promise<IDoctor> {
        const Doctor = await DoctorModel.create(doctorData)
        return  Doctor
    }

    async findByEmail(email: string): Promise<IDoctor | null> {
        const Doctor =  await DoctorModel.findOne({email})
        return Doctor
    }

    async update(id: string, doctor: Partial<IDoctor>): Promise<IDoctor | null> {
       const Doctor =   await DoctorModel.findByIdAndUpdate(id,doctor)
       return Doctor
    }

    async findById(id: string): Promise<IDoctor | null> {
        const Doctor = await DoctorModel.findById(id)
        return Doctor
    }


}