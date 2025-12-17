// src/dtos/appointment.create.dto.ts
export type TCreateAppointmentDTO = {
  userId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
};


export type TCreateAppointmentResponseDTO = {
  appointmentId: string;
  status: "PENDING";
  amount: number;
};