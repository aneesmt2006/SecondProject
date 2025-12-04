import type { IDoctorSlot, IDoctorSlotDoc } from "../../utils/interface.utils.js";

export interface IDoctorSlotRepository {
  createOrUpdateSlot(data: IDoctorSlot): Promise<IDoctorSlotDoc>;
  getSlotByDoctorId(doctorId: string): Promise<IDoctorSlotDoc | null>;
  getAllSlots(): Promise<IDoctorSlotDoc[]>;
}
