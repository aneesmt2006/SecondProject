import type { IAppointentRepository } from "../repositories/interfaces/IAppoinmentRepository.js";
import type { IAppointment } from "../utils/interface.utils.js";
import { inject, injectable } from "inversify";
import type { IAppoinmentService } from "./interfaces/IAppoinmentService.js";
import type { TCreateAppointmentDTO, TCreateAppointmentResponseDTO } from "../dtos/appoinment.dto.js";
import { TYPES } from "../types/type.js";
import app from "../app.js";
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";



@injectable()
export class AppoinmentService implements IAppoinmentService {
    constructor(@inject(TYPES.AppoinmentRepository)private _appoinmentRepo:IAppointentRepository){}

    async create(appoinment: TCreateAppointmentDTO): Promise<{ appoinment: TCreateAppointmentResponseDTO; message: string; }> {
        const appointmentData: IAppointment = { ...appoinment, status: "PENDING" };
        const appoinmentDoc = await this._appoinmentRepo.create(appointmentData)

        if(!appoinmentDoc){
            throw new Error(ERROR_MESSAGE.DB_NOT_EXIST)
        }

        const mappedAppoinment = ResponseMapper.appoinmentMapper(appoinmentDoc)

        return  {appoinment:mappedAppoinment,message:SUCCESS_MESSAGE.APMNT_CREATED}
    }

    async update(id: string, status: string): Promise<{appoinment:TCreateAppointmentResponseDTO,message:string}> {
        const updatedAppoinment = await this._appoinmentRepo.update(id,status)
        if(!updatedAppoinment) throw new Error(ERROR_MESSAGE.DB_NOT_EXIST)

        const mappedAppoinment = ResponseMapper.appoinmentMapper(updatedAppoinment)
        
        return {appoinment:mappedAppoinment,message:SUCCESS_MESSAGE.APMNT_UPDATED}
    }
}