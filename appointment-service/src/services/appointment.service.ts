import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import type { IAppointment, PatientDet } from "../utils/interface.utils.js";
import { inject, injectable } from "inversify";
import type { IAppointmentService } from "./interfaces/IAppointmentService.js";
import type { TApmntPatientsDetailsDTO, TCompleteAppointmentDTO, TCreateAppointmentDTO, TCreateAppointmentResponseDTO, TUserVisitHistoryDTO } from "../dtos/appointment.dto.js";
import { TYPES } from "../types/type.js";
import { COMMON_MESSAGE, ERROR_MESSAGE, SUCCESS_MESSAGE } from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { getChannel, APPOINTMENT_EXCHANGE } from "../config/rabbitmq.config.js";
import { parseDate } from "../utils/date.utils.js";
import { isLocked, lockSlot, releaseSlot } from "../utils/redis.worker.utils.js";
import { randomUUID } from "crypto";
import type { MedicalClient } from "../client/medical.client.js";
import type { UserClient } from "../client/user.client.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@injectable()
export class AppointmentService implements IAppointmentService {
    constructor(
        @inject(TYPES.AppointmentRepository) private _appointmentRepo: IAppointentRepository,
        @inject(TYPES.MedicalClient) private _medicalClient: MedicalClient,
        @inject(TYPES.UserClient) private _userClient: UserClient
    ) {}

    async create(appointment: TCreateAppointmentDTO): Promise<{ appointment: TCreateAppointmentResponseDTO; message: string; }> {
        const isFirstBooking = await this._appointmentRepo.findByUserId(appointment.userId);
        if (!isFirstBooking || isFirstBooking.length === 0) {
            await this._medicalClient.assingPrimaryDoctor(appointment.doctorId, appointment.userId);
        } 

        const randomId = randomUUID();

        const lockingSlot = await lockSlot(appointment.doctorId, appointment.appointmentDate, appointment.appointmentTime, randomId);
        if (!lockingSlot) {
            throw new AppError("The slot is booked already by someone, try another slot", HTTP_STATUS.BAD_REQUEST);
        }

        const appointmentData: IAppointment = { ...appointment, status: "PENDING", lockToken: randomId };
        const appointmentDoc = await this._appointmentRepo.create(appointmentData);

        if (!appointmentDoc) {
            throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const mappedAppointment = ResponseMapper.appointmentMapper(appointmentDoc);
        return { appointment: mappedAppointment, message: SUCCESS_MESSAGE.APMNT_CREATED };
    }

    async update(id: string, status: string): Promise<{ appointment: TCreateAppointmentResponseDTO, message: string }> {
        const existingApp = await this._appointmentRepo.findById(id);
        if (!existingApp) throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.NOT_FOUND);

        const isSlotExpire = await isLocked(existingApp.doctorId, existingApp.appointmentDate, existingApp.appointmentTime);
        
        if (existingApp.status === 'EXPIRED') {
            const channel = getChannel();
            const payload = { 
                status: 'REFUNDED', 
                eventType: 'PAYMENT_REFUNDED', 
                appointmentId: existingApp._id, 
                appointmentDate: existingApp.appointmentDate, 
                appointmentTime: existingApp.appointmentTime 
            };
            channel.publish(APPOINTMENT_EXCHANGE, 'appointment.cancelled', Buffer.from(JSON.stringify(payload)));
            throw new AppError("Due to time expire, slot is booked by someone. Payment will refund", HTTP_STATUS.BAD_REQUEST);
        }
        
        const updatedAppointment = await this._appointmentRepo.update(id, status);
        if (!updatedAppointment) {
            throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const mappedAppointment = ResponseMapper.appointmentMapper(updatedAppointment);

        if (mappedAppointment.status === 'CANCELLED') {
            const channel = getChannel();
            const payload = { 
                status: 'REFUNDED', 
                eventType: 'PAYMENT_REFUNDED', 
                appointmentId: mappedAppointment.appointmentId, 
                appointmentDate: mappedAppointment.appointmentDate, 
                appointmentTime: mappedAppointment.appointmentTime 
            };
            channel.publish(APPOINTMENT_EXCHANGE, 'appointment.cancelled', Buffer.from(JSON.stringify(payload)));
        }

        releaseSlot(updatedAppointment.doctorId, updatedAppointment.appointmentDate, updatedAppointment.appointmentTime, updatedAppointment.lockToken);
        return { appointment: mappedAppointment, message: SUCCESS_MESSAGE.APMNT_UPDATED };
    }

    async findAllDrappointments(doctorId: string, date?: string): Promise<{ patients: TApmntPatientsDetailsDTO[]; message: string; }> {
        const now = new Date();

        const query: any = {
            doctorId,
            status: { $in: ['SUCCESS', 'BOOKED'] },
            consultationStatus: 'PENDING',
        };

        if (date && date.trim() !== "") {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
                query.appointmentDate = parsed.toLocaleDateString("en-US");
            }
        }

        const appointments = await this._appointmentRepo.getAllAppointmentsForDoctor(query);
        
        if (!appointments || appointments.length === 0) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        let filtered = appointments;
        if (!date || date.trim() === "") {
            filtered = appointments.filter(a =>
                a.consultationStatus === 'PENDING' &&
                now < new Date(parseDate(a.appointmentDate, a.appointmentTime).getTime() + 30 * 60 * 1000)
            );
        }

        filtered.sort((a, b) => 
            parseDate(a.appointmentDate, a.appointmentTime).getTime() - 
            parseDate(b.appointmentDate, b.appointmentTime).getTime()
        );

        if (filtered.length === 0) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        const patientIds = filtered.map(apmnt => apmnt.userId).filter(Boolean);
        
        let patientDetails: PatientDet[] = [];
        try {
            const response = await this._medicalClient.fetchPatientProfile(patientIds, doctorId);
            patientDetails = response.data?.data || [];
        } catch (error: any) {
            logger.error("Medical service for patient details connecting Error:", { error: error.message });
            throw new AppError("Failed to connect to medical service for patient details", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        if (patientDetails.length === 0) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        const patientMap = new Map<string, PatientDet>();
        patientDetails.forEach(patient => patientMap.set(patient.userId, patient));

        const merged: TApmntPatientsDetailsDTO[] = filtered.map((apmnt) => {
            const patientDet = patientMap.get(apmnt.userId);

            return {
                appointmentId: apmnt._id!,
                userId: apmnt.userId,
                fullName: patientDet?.fullName || "Unknown",
                week: patientDet?.week || 0,
                age: patientDet?.age || 0,
                isFirstPregnancy: patientDet?.isFirstPregnancy || false,
                trimester: patientDet?.trimester || "Unknown",
                appointmentDate: apmnt.appointmentDate,
                appointmentTime: apmnt.appointmentTime,
                consultationStatus: apmnt.consultationStatus || "PENDING"
            };
        });

        return { patients: merged, message: COMMON_MESSAGE.FETCH_SUCCESS };
    }

    async complete(data: TCompleteAppointmentDTO): Promise<{ message: string; }> {
        const { appointmentId, notes } = data;

        const existingApmnt = await this._appointmentRepo.findById(appointmentId);
        if (!existingApmnt) {
            throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.NOT_FOUND);
        }

        await this._appointmentRepo.updateAppointment(appointmentId, {
            notes,
            consultationStatus: "COMPLETED"
        });

        return { message: SUCCESS_MESSAGE.APMNT_UPDATED };
    }

    async getUserVisitHistory(userId: string): Promise<{ history: TUserVisitHistoryDTO; message: string; }> {
        const appointments = await this._appointmentRepo.findByUserId(userId);

        if (!appointments || appointments.length === 0) {
            return {
                history: { upcoming: null as any, history: [] },
                message: COMMON_MESSAGE.FETCH_SUCCESS
            };
        }

        const doctorIds = Array.from(new Set(appointments.map(a => a.doctorId)));

        let doctorProfiles: any[] = [];
        try {
            doctorProfiles = await this._userClient.fetchDoctorProfiles(doctorIds);
        } catch (error: any) {
            logger.error("Failed to fetch doctor profiles for history", { error: error.message });
        }

        const doctorMap = new Map<string, any>();
        if (doctorProfiles) {
            doctorProfiles.forEach(p => doctorMap.set(p.doctorId, p));
        }

        const now = new Date();

        const mappedAppointments = appointments.map(apmnt => {
            const dr = doctorMap.get(apmnt.doctorId);
            const appointmentDateObj = parseDate(apmnt.appointmentDate, apmnt.appointmentTime);
            
            let status: 'Completed' | 'Upcoming' | 'Cancelled' | 'Scheduled' | 'Expired' = 'Scheduled';
            if (apmnt.consultationStatus === 'COMPLETED') {
                status = 'Completed';
            } else if (apmnt.status === 'CANCELLED' || apmnt.status === 'CANCELED') {
                status = 'Cancelled';
            } else if (appointmentDateObj > now || now < new Date(appointmentDateObj.getTime() + 30 * 60 * 1000)) {
                status = 'Upcoming';
            } else if (appointmentDateObj) {
                status = 'Expired';
            }

            return {
                appointmentId: apmnt._id!,
                doctorName: dr?.fullName || "Doctor",
                specialization: dr?.specialization || "General Consultation",
                appointmentDate: apmnt.appointmentDate,
                appointmentTime: apmnt.appointmentTime,
                reason: "General Consultation",
                notes: apmnt.notes,
                status,
                doctorImage: dr?.profileImageLink,
                hospitalName: dr?.clinicName || "Clinic"
            };
        });

        mappedAppointments.sort((a, b) => {
            return parseDate(b.appointmentDate, b.appointmentTime).getTime() - parseDate(a.appointmentDate, a.appointmentTime).getTime();
        });

        const upcomingList = mappedAppointments
            .filter(a => a.status === 'Upcoming')
            .sort((a, b) => parseDate(a.appointmentDate, a.appointmentTime).getTime() - parseDate(b.appointmentDate, b.appointmentTime).getTime());
        
        const upcoming = upcomingList.length > 0 ? upcomingList[0] : null;
        const history = mappedAppointments.filter(a => a !== upcoming);

        return {
            history: {
                upcoming: upcoming as any,
                history: history as any[]
            },
            message: COMMON_MESSAGE.FETCH_SUCCESS
        };
    }

    async findMainDoctor(userId: string): Promise<{ doctorId: string; message: string; }> {
        const mainDoctor = await this._appointmentRepo.findByUserId(userId);
        const doctorId = mainDoctor[0]?.doctorId;
        
        if (!doctorId) {
             throw new AppError("No main doctor found", HTTP_STATUS.NOT_FOUND);
        }

        return { doctorId, message: COMMON_MESSAGE.FETCH_SUCCESS };
    }
}
