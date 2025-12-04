import type { TDoctorProfileUpdateRequestDTO, TDoctorProfileResponseDTO } from "../../dtos/doctor.dto.js";

export interface IDoctorProfileService {
  updateProfile(doctorId: string, data: TDoctorProfileUpdateRequestDTO): Promise<{ profile: TDoctorProfileResponseDTO; message: string }>;
  getProfile(doctorId: string): Promise<{ profile: TDoctorProfileResponseDTO; message: string }>;
  getAllDoctors(): Promise<{ profiles: TDoctorProfileResponseDTO[]; message: string }>;
}
