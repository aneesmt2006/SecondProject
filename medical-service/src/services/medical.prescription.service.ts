import { inject, injectable } from "inversify";
import { TYPES } from "../types/type.js";
import type { IMedicalPrescriptionService } from "./interfaces/IMedicalPrescriptionService.js";
import type { IMedicalPrescriptionRepository } from "../repositories/interfaces/IMedicalPrescriptionRepository.js";
import type { IMedicalPrescription } from "../utils/interface.utils.js";
import { COMMON_RESPONSE_MESSAGES } from "../constants/response-messages.constants.js";

@injectable()
export class MedicalPrescriptionService implements IMedicalPrescriptionService {
  constructor(
    @inject(TYPES.MedicalPrescriptionRepository) private _prescriptionRepo: IMedicalPrescriptionRepository
  ) {}

  async createPrescription(data: IMedicalPrescription): Promise<{data:IMedicalPrescription,message:string}> {
    const res = await this._prescriptionRepo.create(data);
    return {data:res , message:COMMON_RESPONSE_MESSAGES.SUCCESS}
  }

  async getPrescriptionByAppointmentId(appointmentId: string): Promise<{ data: IMedicalPrescription | null; message: string }> {
    const res = await this._prescriptionRepo.findByAppointmentId(appointmentId);
    if(!res?.content) return {data:null,message:"Not provided prescription"}
    return { data: res, message: COMMON_RESPONSE_MESSAGES.SUCCESS };
  }

  async getPrescriptionsByUserId(userId: string): Promise<{ data: IMedicalPrescription[] | null; message: string }> {
    const res = await this._prescriptionRepo.findByUserId(userId);
    return { data: res, message: COMMON_RESPONSE_MESSAGES.SUCCESS };
  }
}
