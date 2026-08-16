import type { TBookedDoctors, TCreateAppointmentResponseDTO } from "../dtos/appointment.dto.js";
import type { DoctorsProfile, IAppointment, TAppointmentStatus } from "./interface.utils.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";


export class ResponseMapper {
    static appointmentMapper(repoData:IAppointment):TCreateAppointmentResponseDTO{
        return {
            appointmentId:repoData._id!,
            amount:repoData.amount,
            status:repoData.status,
            appointmentDate:repoData.appointmentDate||'',
            appointmentTime:repoData.appointmentTime||'',
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

    static doctorProfileForUserChatMapping(repoData:DoctorsProfile):TBookedDoctors{
        return {
            id:repoData.doctorId,
            name:repoData.fullName,
            specialty:repoData.specialization,
            avatarUrl:repoData.profileImageLink

        }
    }
}