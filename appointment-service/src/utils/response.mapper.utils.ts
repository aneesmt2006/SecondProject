import type { TCreateAppointmentResponseDTO } from "../dtos/appoinment.dto.js";
import type { IAppointment, TAppointmentStatus } from "./interface.utils.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";


export class ResponseMapper {
    static appoinmentMapper(repoData:IAppointment):TCreateAppointmentResponseDTO{
        return {
            appointmentId:repoData._id!,
            amount:repoData.amount,
            status:"PENDING",
            appoinmentDate:repoData.appointmentDate||'',
            appoinmentTime:repoData.appointmentTime||'',
            doctorId:repoData.doctorId||'',
            userId:repoData.userId||'',
        }
    }

    static doctorSlotMapping(repoData: any): TDoctorSlotResponseDTO {
        return {
            id: repoData._id!,
            doctorId: repoData.doctorId,
            days: repoData.schedule,
            slotDuration: repoData.slotDuration,
            unavailableDates:repoData.unavailableDates,
            createdAt: repoData.createdAt?.toISOString() || '',
            updatedAt: repoData.updatedAt?.toISOString() || ''
        }
    }
}