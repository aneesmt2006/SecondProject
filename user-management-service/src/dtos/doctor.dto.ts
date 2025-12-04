import type { IDoctorProfile } from "../utils/interface.utils.js";

export type TDoctorProfileUpdateRequestDTO = IDoctorProfile 

export type TDoctorProfileResponseDTO = IDoctorProfile & {
    doctorId:string
}
