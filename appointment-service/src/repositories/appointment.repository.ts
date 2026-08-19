import { injectable } from "inversify";
import type { IAppointentRepository } from "./interfaces/IAppointmentRepository.js";
import type { AppointmentQuery, IAppointment } from "../utils/interface.utils.js";
import { AppointmentModel } from "../models/appointment.model.js";
import { Types } from "mongoose";


@injectable()
export class AppointmentRepository implements IAppointentRepository {

    async create(appointment: IAppointment): Promise<IAppointment> {
        return await AppointmentModel.create(appointment)
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
        // return await AppointmentModel.find({query!.doctorId}).sort({ appointmentDate: 1, appointmentTime: 1 });
        return await AppointmentModel.find(query)
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

    async findByDoctorId(doctorId: string): Promise<IAppointment[] | null> {
         return await AppointmentModel.find({doctorId})
    }

    async findPendingBySlot(doctorId: string, date: string, time: string): Promise<IAppointment | null> {
        return await AppointmentModel.findOne({
            doctorId,
            appointmentDate: date,
            appointmentTime: time,
            status: "PENDING"
        });
    }

    async findConfirmAppointmentsByDate(doctorId: string, statuses: string[], dates: string[]): Promise<IAppointment[] | null> {
        return await AppointmentModel.find({ doctorId, appointmentDate: { $in: dates }, status: { $in: statuses } });
    }

    async updateMany(ids: string[], status: string): Promise<boolean> {
        const result = await AppointmentModel.updateMany({ _id: { $in: ids } }, { $set: { status } });
        return result.modifiedCount > 0;
    }

}
