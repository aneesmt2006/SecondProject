import type { TCreateAppointmentDTO, TCreateAppointmentResponseDTO,} from "../../dtos/appoinment.dto.js";
import type { IAppointment } from "../../utils/interface.utils.js";

export interface IAppoinmentService {
    create(appoinment:TCreateAppointmentDTO):Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}>,
    update(id:string,status:string):Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}>
    
}