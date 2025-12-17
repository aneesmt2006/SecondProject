import { injectable } from "inversify";
import DoctorProfileModel from "../models/doctor.profile.model.js";
import type { IDoctorProfileRepository } from "./interfaces/IDoctorProfileRepository.js";
import type { IDoctorProfileDoc } from "../utils/interface.utils.js";

@injectable()
export class DoctorProfileRepository implements IDoctorProfileRepository {
  async create(data: IDoctorProfileDoc): Promise<IDoctorProfileDoc> {
    return await DoctorProfileModel.create(data);
  }

  async update(doctorId: string, data: Partial<IDoctorProfileDoc>): Promise<IDoctorProfileDoc | null> {
    return await DoctorProfileModel.findOneAndUpdate({ doctorId }, data, { new: true, upsert: true });
  }

  async findByDoctorId(doctorId: string): Promise<IDoctorProfileDoc | null> {
    return await DoctorProfileModel.findOne({ doctorId});
  }

  async findDoctorsByIds(doctorIds: string[]): Promise<IDoctorProfileDoc[]> {
    return await DoctorProfileModel.find({doctorId:{$in:doctorIds}})
  }

  async findAll(): Promise<IDoctorProfileDoc[]> {
    return await DoctorProfileModel.find();
  }

  async findByCategory(category: Record<string, any>, page: number, limit: number): Promise<{profiles:IDoctorProfileDoc[],pageCounts:number}> {
    const profiles =  await DoctorProfileModel.find(category).skip((page-1)*limit).limit(limit)
    const count = await DoctorProfileModel.countDocuments(category)
    return {profiles,pageCounts:count}
  }
}
