import type {
  TBookedDoctors,
  TCreateAppointmentResponseDTO,
} from "../dtos/appointment.dto.js";
import type {
  DoctorsProfile,
  IAppointment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TAppointmentStatus,
} from "./interface.utils.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";

export class ResponseMapper {
  static appointmentMapper(
    repoData: IAppointment,
  ): TCreateAppointmentResponseDTO {
    return {
      appointmentId: repoData._id!,
      amount: repoData.amount,
      status: repoData.status,
      appointmentDate: repoData.appointmentDate || "",
      appointmentTime: repoData.appointmentTime || "",
      doctorId: repoData.doctorId || "",
      userId: repoData.userId || "",
    };
  }

  static doctorSlotMapping(repoData: any): TDoctorSlotResponseDTO {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: repoData._id!,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      doctorId: repoData.doctorId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      days: repoData.schedule,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      slotDuration: repoData.slotDuration,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      unavailableDates: repoData.unavailableDates,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      createdAt: repoData.createdAt?.toISOString() || "",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      updatedAt: repoData.updatedAt?.toISOString() || "",
    };
  }

  static doctorProfileForUserChatMapping(
    repoData: DoctorsProfile,
  ): TBookedDoctors {
    return {
      id: repoData.doctorId,
      name: repoData.fullName,
      specialty: repoData.specialization,
      avatarUrl: repoData.profileImageLink,
    };
  }
}
