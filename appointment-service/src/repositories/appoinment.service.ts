import { injectable } from "inversify";
import type { IAppointentRepository } from "./interfaces/IAppoinmentRepository.js";
import type { IAppointment } from "../utils/interface.utils.js";
import { AppointmentModel } from "../models/appoinment.model.js";


@injectable()
export class AppoinmentRepository implements IAppointentRepository {

    async create(appoinment: IAppointment): Promise<IAppointment> {
        return await AppointmentModel.create(appoinment)
    }

    async find(doctorId: string, date: string): Promise<IAppointment[]> {
        return await AppointmentModel.find({doctorId,appointmentDate:date})
    }

    async update(id: string, status: string): Promise<IAppointment|null> {
        return await AppointmentModel.findByIdAndUpdate(id,{status},{new:true})
    }
}