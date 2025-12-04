import type { IDoctorSlot } from "../../utils/interface.utils.js";
import type { TDoctorSlotResponseDTO } from "../../dtos/doctor.slot.dto.js";

export interface IDoctorSlotService {
  createOrUpdateSlot(data: IDoctorSlot): Promise<{ slot: TDoctorSlotResponseDTO; message: string }>;
  getSlotByDoctorId(doctorId: string): Promise<{ slot: TDoctorSlotResponseDTO; message: string }>;
  getAllSlots(): Promise<{ slots: TDoctorSlotResponseDTO[]; message: string }>;
}
