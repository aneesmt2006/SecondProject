import { inject, injectable } from "inversify";
import { TYPES } from "../types/type.js";
import type { ISymptomsRepository } from "./interfaces/ISymptomsRepository.js";
import type { ISymptoms } from "../utils/interface.utils.js";
import symptomsModel from "../models/symptoms.model.js";


@injectable()
export class SymptomsRepository implements ISymptomsRepository {
    
    async create(symptomsData: ISymptoms): Promise<ISymptoms | null> {
        return await symptomsModel.create(symptomsData)
    }

    async update(id:string,symptomsData: ISymptoms): Promise<ISymptoms | null> {
        return await symptomsModel.findOneAndUpdate({_id:id},symptomsData,{new:true})
    }

    async findById(id: string): Promise<ISymptoms | null> {
         return await symptomsModel.findById(id)
    }

    async findByWeek(week: number): Promise<ISymptoms | null> {
        return await symptomsModel.findOne({week})
    }

    async find(): Promise<ISymptoms[] | null> {
        return await symptomsModel.find({})
    }
}