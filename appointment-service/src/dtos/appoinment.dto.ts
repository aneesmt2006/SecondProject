// src/dtos/appointment.create.dto.ts
export type TCreateAppointmentDTO = {
  userId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  isRecurring: boolean;
};

export type TCreateAppointmentResponseDTO = {
  appointmentId: string;
  status: string;
  amount: number;
  userId?: string;
  doctorId?: string;
  appoinmentDate?: string;
  appoinmentTime?: string;
};

export type TApmntPatientsDetailsDTO = {
  appointmentId: string;
  userId: string;
  fullName: string;
  week: number;
  age: number;
  isFirstPregnancy?: boolean;
  trimester: string;
  consultationStatus:string;
  appoinmentDate?: string;
  appoinmentTime?: string;
};

export type TCompleteAppointmentDTO = {
  appointmentId: string;
  userId: string;
  isRecurring: boolean;
  notes: string;
  time: string;
  previewDates: string[];
};

export type TUserAppointmentDTO = {
    appointmentId: string;
    doctorName: string;
    specialization: string;
    appoinmentDate: string;
    appoinmentTime: string;
    reason: string;
    notes?: string;
    status: 'Completed' | 'Upcoming' | 'Cancelled' | 'Scheduled';
    doctorImage?: string;
    hospitalName?: string;
};

export type TUserVisitHistoryDTO = {
    upcoming: TUserAppointmentDTO | null;
    history: TUserAppointmentDTO[];
};
