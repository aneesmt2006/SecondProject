import type { IMedicalPrescription } from "../../utils/interface.utils.js";

export interface IMedicalPrescriptionService {
  createPrescription(
    data: IMedicalPrescription,
  ): Promise<{ data: IMedicalPrescription; message: string }>;
  getPrescriptionByAppointmentId(
    appointmentId: string,
  ): Promise<{ data: IMedicalPrescription | null; message: string }>;
  getPrescriptionsByUserId(
    userId: string,
  ): Promise<{ data: IMedicalPrescription[] | null; message: string }>;
}
