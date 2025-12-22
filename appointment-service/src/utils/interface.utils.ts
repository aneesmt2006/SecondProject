export type TAppointmentStatus =
  | "PENDING"
  | "BOOKED"
  | "CANCELLED"
  | "EXPIRED";

export interface IAppointment {
  _id?: string;
  userId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  status: TAppointmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBreak {
  start: string;
  end: string;
}

export interface IDaySchedule {
  enabled: boolean;
  start?: string;
  end?: string;
  breaks: IBreak[];
}

export interface IDoctorSlot {
  doctorId: string;
  schedule: {
    Monday: IDaySchedule;
    Tuesday: IDaySchedule;
    Wednesday: IDaySchedule;
    Thursday: IDaySchedule;
    Friday: IDaySchedule;
    Saturday: IDaySchedule;
    Sunday: IDaySchedule;
  };
  slotDuration: string;
  unavailableDates: string[];
}

export interface IDoctorSlotDoc extends IDoctorSlot {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WeekDays = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
