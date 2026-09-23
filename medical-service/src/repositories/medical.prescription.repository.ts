import { injectable } from "inversify";
import MedicalPrescriptionModel from "../models/prescription.model.js";
import type { IMedicalPrescriptionRepository } from "./interfaces/IMedicalPrescriptionRepository.js";
import type { IMedicalPrescription } from "../utils/interface.utils.js";

@injectable()
export class MedicalPrescriptionRepository implements IMedicalPrescriptionRepository {
  async create(data: IMedicalPrescription): Promise<IMedicalPrescription> {
    return await MedicalPrescriptionModel.findOneAndUpdate(
      { appointmentId: data.appointmentId },
      { $set: data },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
  }

  async findByAppointmentId(appointmentId: string): Promise<IMedicalPrescription | null> {
    return await MedicalPrescriptionModel.findOne({ appointmentId });
  }

  async findByUserId(userId: string): Promise<IMedicalPrescription[] | null> {
    return await MedicalPrescriptionModel.find({ userId });
  }
}
