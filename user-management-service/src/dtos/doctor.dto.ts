import type { IDaySchedule, IDoctorProfile, IDoctorSlot } from "../utils/interface.utils.js";

export type TDoctorProfileUpdateRequestDTO = IDoctorProfile 

export type TDoctorProfileResponseDTO = IDoctorProfile & {
    doctorId:string
}

export type TDoctorApmntDetDTO = {
    doctorId:string,
    fullName?: string;
    experience: string;
    profileImageLink?: string;
    online_fee: string;
}

export type TDoctorBooksSlotsDTO = {
    doctorId:string,
    specialization:string,
    profileImageLink:string,
    online_fee:string,
    slots:{time:string,status:string}[],
    slotDuration:string,
    address:string

}
