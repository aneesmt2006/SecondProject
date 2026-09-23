import type { TApmntPatientsDetailsDTO, TCompleteAppointmentDTO, TCreateAppointmentDTO, TCreateAppointmentResponseDTO, TUserVisitHistoryDTO} from "../../dtos/appointment.dto.js";
import type { IAppointment, IAdminDashboardStats, IBookingManagementStats, IDoctorDashboardStats } from "../../utils/interface.utils.js";

export interface IAppointmentService {
    create(appointment:TCreateAppointmentDTO):Promise<{appointment:TCreateAppointmentResponseDTO,message:string}>,
    update(id:string,status:string):Promise<{appointment:TCreateAppointmentResponseDTO,message:string}>
    findAllDrappointments(doctorId:string,status?:string):Promise<{patients:TApmntPatientsDetailsDTO[],message:string}>
    complete(data:TCompleteAppointmentDTO):Promise<{message:string}>
    getUserVisitHistory(userId:string):Promise<{history:TUserVisitHistoryDTO,message:string}>
    findMainDoctor(userId:string):Promise<{doctorId:string,message:string}>
    getAdminDashboardStats(period: 'daily' | 'monthly' | 'yearly', role?: string, userId?: string): Promise<{ stats: IAdminDashboardStats, message: string }>
    getAdminAppointmentsList(page: number, limit: number, filter?: any): Promise<{ appointments: any[], totalPages: number, currentPage: number, totalCount: number, message: string }>
    getBookingManagementStats(): Promise<{ stats: IBookingManagementStats, message: string }>
    getDoctorDashboardStats(doctorId: string): Promise<{ stats: IDoctorDashboardStats, message: string }>
}
