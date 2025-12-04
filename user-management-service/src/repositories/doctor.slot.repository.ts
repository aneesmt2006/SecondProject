import { injectable } from "inversify";
import DoctorSlotModel from "../models/doctor.slot.model.js";
import type { IDoctorSlot, IDoctorSlotDoc } from "../utils/interface.utils.js";
import type { IDoctorSlotRepository } from "./interfaces/IDoctorSlotRepository.js";

@injectable()
export class DoctorSlotRepository implements IDoctorSlotRepository {
  async createOrUpdateSlot(data: IDoctorSlot): Promise<IDoctorSlotDoc> {
    const { doctorId } = data;
    return await DoctorSlotModel.findOneAndUpdate(
      { doctorId },
      { $set: data },
      { new: true, upsert: true }
    ) as IDoctorSlotDoc;
  }

  async getSlotByDoctorId(doctorId: string): Promise<IDoctorSlotDoc | null> {
    return await DoctorSlotModel.findOne({ doctorId }) as IDoctorSlotDoc;
  }

  async getAllSlots(): Promise<IDoctorSlotDoc[]> {
    return await DoctorSlotModel.find() as IDoctorSlotDoc[];
  }
}
