import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AppointmentQuery,
  IAppointment,
  ITopDoctor,
  IRawFacetStats,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IDoctorDashboardStats,
} from "../../utils/interface.utils.js";

export interface IAppointentRepository {
  create(appointment: IAppointment): Promise<IAppointment>;
  update(id: string, status: string): Promise<IAppointment | null>;
  find(doctorId: string, date: string): Promise<IAppointment[]>;
  findById(id: string): Promise<IAppointment | null>;
  updateAppointment(
    id: string,
    data: Partial<IAppointment>,
  ): Promise<IAppointment | null>;
  getAllAppointmentsForDoctor(query: any): Promise<IAppointment[]>;
  findByUserId(userId: string): Promise<IAppointment[]>;
  findMainDoctor(
    userId: string,
  ): Promise<{ doctorId: string; count: number }[]>;
  findByDoctorId(doctor: string): Promise<IAppointment[] | null>;
  findPendingBySlot(
    doctorId: string,
    date: string,
    time: string,
  ): Promise<IAppointment | null>;
  findConfirmAppointmentsByDate(
    doctorId: string,
    statuses: string[],
    dates: string[],
  ): Promise<IAppointment[] | null>;
  updateMany(ids: string[], status: string): Promise<boolean>;
  findAdminStats(): Promise<IRawFacetStats>;
  findAdminList(
    page: number,
    limit: number,
    filter: any,
  ): Promise<{ data: IAppointment[]; total: number }>;
  getUpcomingAppointmentsCount(): Promise<number>;
  getTopDoctors(limit: number): Promise<ITopDoctor[]>;
  getDoctorDashboardStats(doctorId: string): Promise<{
    todayAppointments: number;
    rawUpcoming: IAppointment[];
    totalPatients: number;
  }>;
}
