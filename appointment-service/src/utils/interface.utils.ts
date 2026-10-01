export type TAppointmentStatus =
  | "PENDING"
  | "BOOKED"
  | "SUCCESS"
  | "CANCELED"
  | "CANCELLED"
  | "EXPIRED"
  | "COMPLETED"
  | "REFUNDED";

export interface IAppointment {
  _id?: string;
  userId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  status: TAppointmentStatus;
  lockToken: string;
  isRecurring?: boolean;
  consultationStatus?: string;
  notes?: string;
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

export type WeekDays =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface AppointmentQuery {
  doctorId: string;
  date?: string;
}

export interface PatientDet {
  userId: string;
  fullName: string;
  age: number;
  week: number;
  trimester: string;
  isFirstPregnancy?: boolean;
}

export interface DoctorsProfile {
  fullName: string;
  specialization: string;
  profileImageLink: string;
  doctorId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PatientProfile {}

export interface ITopDoctor {
  id: string;
  name: string;
  specialty: string;
  appointments: number;
}

export interface IRevenueOverviewItem {
  label: string;
  amount: number;
}

export interface IAdminDashboardStats {
  totalRegisteredWomen: number;
  pendingDoctorApprovals: number;
  upcomingAppointments: number;
  totalRevenue: number;
  revenueOverview: IRevenueOverviewItem[];
  topDoctors: ITopDoctor[];
}

export interface IDoctorDashboardStats {
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
}

export interface IBookingManagementStats {
  totalBookings: number;
  todayBookings: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  refunded: number;
}

export interface IRawFacetStats {
  totalBookings: { count: number }[];
  todayBookings: { count: number }[];
  upcoming: { count: number }[];
  completed: { count: number }[];
  cancelled: { count: number }[];
  refunded: { count: number }[];
}
