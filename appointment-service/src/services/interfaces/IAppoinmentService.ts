import type { TApmntPatientsDetailsDTO, TCompleteAppointmentDTO, TCreateAppointmentDTO, TCreateAppointmentResponseDTO, TUserVisitHistoryDTO,} from "../../dtos/appoinment.dto.js";
import type { IAppointment } from "../../utils/interface.utils.js";

export interface IAppoinmentService {
    create(appoinment:TCreateAppointmentDTO):Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}>,
    update(id:string,status:string):Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}>
    findAllDrappointments(doctorId:string,date?:string):Promise<{patients:TApmntPatientsDetailsDTO[],message:string}>
    complete(data:TCompleteAppointmentDTO):Promise<{message:string}>
    getUserVisitHistory(userId:string):Promise<{history:TUserVisitHistoryDTO,message:string}>
}