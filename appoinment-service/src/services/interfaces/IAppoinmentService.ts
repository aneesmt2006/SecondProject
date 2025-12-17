import type { TCreateAppointmentDTO, TCreateAppointmentResponseDTO } from "../../dtos/appoinment.dto.js";

export interface IAppoinmentService {
    create(appoinment:TCreateAppointmentDTO):Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}>,
    
}