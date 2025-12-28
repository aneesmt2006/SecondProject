import { injectable } from "inversify";
import type { IAppointentRepository } from "./interfaces/IAppoinmentRepository.js";
import type { AppointmentQuery, IAppointment } from "../utils/interface.utils.js";
import { AppointmentModel } from "../models/appoinment.model.js";
import { Types } from "mongoose";


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

    async findById(id: string): Promise<IAppointment | null> {
        return await AppointmentModel.findById(id);
    }

    async updateAppointment(id: string, data: Partial<IAppointment>): Promise<IAppointment | null> {
        return await AppointmentModel.findByIdAndUpdate(id, data, { new: true });
    }

    async getAllAppointmentsForDoctor(query:any): Promise<IAppointment[]> {
        return await AppointmentModel.find(query).sort({ appointmentDate: 1, appointmentTime: 1 });
    }

    async findByUserId(userId: string): Promise<IAppointment[]> {
        return await AppointmentModel.find({ userId });
    }

    async findMainDoctor(userId: string): Promise<{ doctorId: string, count: number }[]> {

        return await AppointmentModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) }}, 
         { $group: {
            _id: "$doctorId",
            count: { $sum: 1 },
             }},
        { $sort: { count: -1 }},
        { $limit: 1 }
         ]);
    }
}