import type { TDoctorProfileUpdateRequestDTO, TDoctorProfileResponseDTO, TDoctorApmntDetDTO } from "../../dtos/doctor.dto.js";

export interface IDoctorProfileService {
  updateProfile(doctorId: string, data: TDoctorProfileUpdateRequestDTO): Promise<{ profile: TDoctorProfileResponseDTO; message: string }>;
  getProfile(doctorId: string): Promise<{ profile: TDoctorProfileResponseDTO; message: string }>;
  getAllDoctors(): Promise<{ profiles: TDoctorProfileResponseDTO[]; message: string }>;
  getAllDoctorsApmntDet():Promise<{doctorsApmnt:TDoctorApmntDetDTO[],message:string}>
  getDoctorsByCategory(specialization: string, page: number, limit: number): Promise<{ profiles: TDoctorProfileResponseDTO[]; pageCounts:number,message: string }>;
  getProfilesForAppointments(doctorIds:string[]):Promise<{profiles:TDoctorProfileResponseDTO[],message:string}>
}

