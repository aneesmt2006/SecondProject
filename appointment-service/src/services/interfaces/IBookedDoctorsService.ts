import type {
  TBookedDoctors,
  TBookedPatients,
} from "../../dtos/appointment.dto.js";

export interface IBookedDoctorsService {
  bookedDoctors(
    userId: string,
  ): Promise<{ bookedDoctors: TBookedDoctors[] | null; message: string }>;
  bookedPatients(
    doctorId: string,
  ): Promise<{ bookedPatients: TBookedPatients[] | null; message: string }>;
}
