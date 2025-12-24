import type { IAppointentRepository } from "../repositories/interfaces/IAppoinmentRepository.js";
import type { IAppointment, PatientDet } from "../utils/interface.utils.js";
import { inject, injectable } from "inversify";
import type { IAppoinmentService } from "./interfaces/IAppoinmentService.js";
import type { TApmntPatientsDetailsDTO, TCompleteAppointmentDTO, TCreateAppointmentDTO, TCreateAppointmentResponseDTO, TUserVisitHistoryDTO } from "../dtos/appoinment.dto.js";
import { TYPES } from "../types/type.js";
import axios from 'axios'
import { COMMON_MESSAGE, ERROR_MESSAGE, SUCCESS_MESSAGE } from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { config } from "../config/env.config.js";
import type { ApiResponse } from "../utils/api.response.utils.js";



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

    async findAllDrappointments(doctorId:string,date?:string): Promise<{ patients: TApmntPatientsDetailsDTO[]; message: string; }> {
        const query: any = {
            doctorId,
            status: { $in: ['SUCCESS', 'BOOKED'] },
            consultationStatus: 'PENDING'
        };

        // Fetch confirmed appointments for this doctor
        const appointments = await this._appoinmentRepo.getAllAppointmentsForDoctor(query);
        
        if (!appointments || appointments.length === 0) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        const now = new Date();
        
       
        const parseToDate = (dStr: string, tStr: string) => {
            try {
                const [m, d, y] = dStr.split('/').map(Number);
                let time = tStr.trim();
                const [timePart, modifier] = time.split(' ');
                let [hours, mins] = timePart!.split(':').map(Number);
                
                if (modifier === 'PM' && hours! < 12) hours! += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                
                return new Date(y!, m! - 1, d, hours, mins);
            } catch (e) {
                return new Date(0);
            }
        };

        let filtered = appointments;

        if (date && date.trim() !== "") {
            // if specific date is requestedddddddd filter for that day
            filtered = appointments.filter(a => a.appointmentDate === date);
        } else {
            // "Coming" appointmentssss Filter for now or future
            filtered = appointments.filter(a => parseToDate(a.appointmentDate, a.appointmentTime) >= now);
        }

        
        filtered.sort((a, b) => 
            parseToDate(a.appointmentDate, a.appointmentTime).getTime() - 
            parseToDate(b.appointmentDate, b.appointmentTime).getTime()
        );

        if (filtered.length === 0) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        const patientIds = filtered.map(apmnt => apmnt.userId).filter(Boolean);
        
        let response;
        try {
            
            const baseUrl = config.usersManagementServiceUrl 
            response = await axios.post<ApiResponse<PatientDet[]>>(`${baseUrl}/patient/profile/forDoctors`, patientIds);
        } catch (error: any) {
            console.error("users managemnt service Service Error:", error.message);
            throw new Error("Failed to connect to users managemnt service");
        }
        
        const patientDetails = response.data.data;
        
        if (!patientDetails) {
            return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
        }

        const patientMap = new Map<string,PatientDet>();
        patientDetails.forEach(patient=>patientMap.set(patient.userId,patient))

        const merged:TApmntPatientsDetailsDTO[] = filtered.map((apmnt)=>{
            const patientDet = patientMap.get(apmnt.userId)

            return {
                appointmentId: apmnt._id!,
                userId: apmnt.userId,
                fullName: patientDet?.fullName || "Unknown",
                week: patientDet?.week || 0,
                age: patientDet?.age || 0,
                isFirstPregnancy: patientDet?.isFirstPregnancy || false,
                trimester: patientDet?.trimester || "Unknown",
                appoinmentDate: apmnt.appointmentDate,
                appoinmentTime: apmnt.appointmentTime,
                consultationStatus: apmnt.consultationStatus || "PENDING"
            }
        })

        return {patients:merged,message:COMMON_MESSAGE.FETCH_SUCCESS}
    }

    async complete(data: TCompleteAppointmentDTO): Promise<{ message: string; }> {
        const { appointmentId, userId, notes, time, previewDates } = data;

        // 1. Find the existing appointment to get doctorId and amount
        const existingApmnt = await this._appoinmentRepo.findById(appointmentId);
        if (!existingApmnt) {
            throw new Error(ERROR_MESSAGE.DB_NOT_EXIST);
        }

        //  Update existingggg appointmentaaagg
        await this._appoinmentRepo.updateAppointment(appointmentId, {
            notes,
            consultationStatus: "COMPLETED"
        });

        //  Create new appointments for each previewDate now i used loop we can also use insertmany 
        if (previewDates && previewDates.length > 0) {
            const newAppointments = previewDates.map(date => ({
                userId,
                doctorId: existingApmnt.doctorId,
                appointmentDate: date,
                appointmentTime: time,
                amount: existingApmnt.amount, 
                status: "PENDING" as const,
                isRecurring: true
            }));

            
            for (const apmnt of newAppointments) {
                await this._appoinmentRepo.create(apmnt);
            }
        }

        return { message: SUCCESS_MESSAGE.APMNT_UPDATED };
    }

    async getUserVisitHistory(userId: string): Promise<{ history: TUserVisitHistoryDTO; message: string; }> {
        //  Fetch all appointments for the user
        const appointments = await this._appoinmentRepo.findByUserId(userId);

        if (!appointments || appointments.length === 0) {
            return {
                history: { upcoming: null, history: [] },
                message: COMMON_MESSAGE.FETCH_SUCCESS
            };
        }

        //Extract unique doctorIds to fetch their profile details
        const doctorIds = Array.from(new Set(appointments.map(a => a.doctorId)));

        let doctorProfiles: any[] = [];
        try {
            const userMgmtUrl = config.usersManagementServiceUrl
            const response = await axios.post<ApiResponse<any[]>>(`${userMgmtUrl}/doctor/profile/forAppointments`, { doctorIds });
            doctorProfiles = response.data.data;
        } catch (error) {
            console.error("Error fetching doctor profiles:", error);
            
        }

        const doctorMap = new Map<string, any>();
        if (doctorProfiles) {
            doctorProfiles.forEach(p => doctorMap.set(p.doctorId, p));
        }

        const now = new Date();

        // Helper to parse "MM/DD/YYYY" and " 3:30 PM"
        const parseDate = (dStr: string, tStr: string) => {
            try {
                const [m, d, y] = dStr.split('/').map(Number);
                let time = tStr.trim();
                const [timePart, modifier] = time.split(' ');
                let [hours, mins] = timePart!.split(':').map(Number);
                if (modifier === 'PM' && hours! < 12) hours! += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return new Date(y!, m! - 1, d, hours, mins);
            } catch (e) {
                return new Date(0);
            }
        };

        const mappedAppointments = appointments.map(apmnt => {
            const dr = doctorMap.get(apmnt.doctorId);
            const apmntDateObj = parseDate(apmnt.appointmentDate, apmnt.appointmentTime);
            
            let status: 'Completed' | 'Upcoming' | 'Cancelled' | 'Scheduled' = 'Scheduled';
            if (apmnt.consultationStatus === 'COMPLETED') {
                status = 'Completed';
            } else if (apmnt.status === 'CANCELLED' || apmnt.status === 'CANCELED') {
                status = 'Cancelled';
            } else if (apmntDateObj > now) {
                status = 'Upcoming';
            } else {
                status = 'Completed'; // If date is past and not cancelled, assume completed/expired shell
            }

            return {
                appointmentId: apmnt._id!,
                doctorName: dr?.fullName || "Doctor",
                specialization: dr?.specialization || "General Consultation",
                appoinmentDate: apmnt.appointmentDate,
                appoinmentTime: apmnt.appointmentTime,
                reason: "General Consultation",
                notes: apmnt.notes,
                status,
                doctorImage: dr?.profileImageLink,
                hospitalName: dr?.clinicName || "Clinic"
            } as any;
        });

        // Sort all by date descending (newest first)
        mappedAppointments.sort((a, b) => {
            return parseDate(b.appoinmentDate, b.appoinmentTime).getTime() - parseDate(a.appoinmentDate, a.appoinmentTime).getTime();
        });

        // Separate Upcoming vs History
        // Upcoming: The closest future appointment
        const upcomingList = mappedAppointments
            .filter(a => a.status === 'Upcoming')
            .sort((a, b) => parseDate(a.appoinmentDate, a.appoinmentTime).getTime() - parseDate(b.appoinmentDate, b.appoinmentTime).getTime());
        
        const upcoming = upcomingList.length > 0 ? upcomingList[0] : null;
        
        // History: Everything else (Past appointments, cancelled, or future ones that aren't the 'closest' if we only want one)
        // User asked for "upcoming: UserAppointment | null" so only one upcoming.
        // History: excluding that one upcoming.
        const history = mappedAppointments.filter(a => a !== upcoming);

        return {
            history: {
                upcoming: upcoming as any,
                history: history as any[]
            },
            message: COMMON_MESSAGE.FETCH_SUCCESS
        };
    }
}