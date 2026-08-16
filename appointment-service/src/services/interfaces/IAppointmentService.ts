import type { TApmntPatientsDetailsDTO, TCompleteAppointmentDTO, TCreateAppointmentDTO, TCreateAppointmentResponseDTO, TUserVisitHistoryDTO} from "../../dtos/appointment.dto.js";
import type { IAppointment } from "../../utils/interface.utils.js";

export interface IAppointmentService {
    create(appointment:TCreateAppointmentDTO):Promise<{appointment:TCreateAppointmentResponseDTO,message:string}>,
    update(id:string,status:string):Promise<{appointment:TCreateAppointmentResponseDTO,message:string}>
    findAllDrappointments(doctorId:string,date?:string):Promise<{patients:TApmntPatientsDetailsDTO[],message:string}>
    complete(data:TCompleteAppointmentDTO):Promise<{message:string}>
    getUserVisitHistory(userId:string):Promise<{history:TUserVisitHistoryDTO,message:string}>
    findMainDoctor(userId:string):Promise<{doctorId:string,message:string}>
}