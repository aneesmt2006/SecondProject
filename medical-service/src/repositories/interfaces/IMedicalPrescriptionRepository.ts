import type { IMedicalPrescription } from "../../utils/interface.utils.js";

export interface IMedicalPrescriptionRepository {
  create(data: IMedicalPrescription): Promise<IMedicalPrescription>;
  findByAppointmentId(
    appointmentId: string,
  ): Promise<IMedicalPrescription | null>;
  findByUserId(userId: string): Promise<IMedicalPrescription[] | null>;
}
