import type { TDoctorSlotInfoDTO } from "../../dtos/doctor.dto.js";

export interface IBookSlotsService {
    getDoctorSlots(doctorId: string, date: string): Promise<{ doctorSlots: TDoctorSlotInfoDTO | null, message: string }>;
}
