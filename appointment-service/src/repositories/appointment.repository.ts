import { injectable } from "inversify";
import type { IAppointentRepository } from "./interfaces/IAppointmentRepository.js";
import type { AppointmentQuery, IAppointment } from "../utils/interface.utils.js";
import { AppointmentModel } from "../models/appointment.model.js";
import type { ITopDoctor, IRawFacetStats, IDoctorDashboardStats } from "../utils/interface.utils.js";
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

    async findAdminStats(): Promise<IRawFacetStats> {
        const todayStr = new Date().toLocaleDateString("en-US");
        const results = await AppointmentModel.aggregate([
            {
                $facet: {
                    totalBookings: [{ $count: "count" }],
                    todayBookings: [{ $match: { appointmentDate: todayStr } }, { $count: "count" }],
                    upcoming: [{ $match: { status: { $in: ["PENDING", "BOOKED", "SUCCESS"] }, consultationStatus: "PENDING" } }, { $count: "count" }],
                    completed: [{ $match: { consultationStatus: "COMPLETED" } }, { $count: "count" }],
                    cancelled: [{ $match: { status: { $in: ["CANCELED", "CANCELLED"] } } }, { $count: "count" }],
                    refunded: [{ $match: { status: "REFUNDED" } }, { $count: "count" }]
                }
            }
        ]);
        return results[0];
    }

    async findAdminList(page: number, limit: number, filter: any): Promise<{ data: IAppointment[], total: number }> {
        const skip = (page - 1) * limit;
        const total = await AppointmentModel.countDocuments(filter);
        const data = await AppointmentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return { data, total };
    }

    async getUpcomingAppointmentsCount(): Promise<number> {
        // Count all total upcoming appointments that are pending or booked
        const count = await AppointmentModel.countDocuments({
            status: { $in: ["PENDING", "BOOKED", "SUCCESS"] },
            consultationStatus: "PENDING"
        });
        
        return count;
    }

    async getTopDoctors(limit: number): Promise<ITopDoctor[]> {
        const topDoctors = await AppointmentModel.aggregate([
            { $match: { status: "SUCCESS" } },
            { $group: { _id: "$doctorId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return topDoctors.map((doc: any) => ({
            id: doc._id,
            name: `Doctor ${doc._id.substring(0, 4)}`, // Placeholder name since auth-service holds names
            specialty: "General", // Placeholder
            appointments: doc.count
        }));
    }

    async getDoctorDashboardStats(doctorId: string): Promise<{ todayAppointments: number, rawUpcoming: IAppointment[], totalPatients: number }> {
        const todayStr = new Date().toLocaleDateString("en-US");
        
        const todayAppointments = await AppointmentModel.countDocuments({
            doctorId,
            appointmentDate: todayStr,
            status: { $in: ["PENDING", "BOOKED", "SUCCESS"] },
            consultationStatus: "PENDING"
        });

        const rawUpcoming = await AppointmentModel.find({
            doctorId,
            status: { $in: ["PENDING", "BOOKED", "SUCCESS"] },
            consultationStatus: "PENDING"
        }, { appointmentDate: 1, appointmentTime: 1 });

        const distinctPatients = await AppointmentModel.distinct("userId", { doctorId });
        const totalPatients = distinctPatients.length;

        return {
            todayAppointments,
            rawUpcoming,
            totalPatients
        };
    }
}
