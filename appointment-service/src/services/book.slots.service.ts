import { inject, injectable } from "inversify";
import type { IBookSlotsService } from "./interfaces/IBookSlotsService.js";
import { TYPES } from "../types/type.js";
import type { IDoctorSlotRepository } from "../repositories/interfaces/IDoctorSlotRepository.js";
import type { TDoctorSlotInfoDTO } from "../dtos/doctor.dto.js";
import type { WeekDays } from "../utils/interface.utils.js";
import { DOCTOR_SLOT_MESSAGES } from "../constants/response-messages.constants.js";
import { generateAvailableSlots } from "../utils/generate.availableslots.utils.js";
import { AppointmentModel } from "../models/appoinment.model.js";
import type { IAppointentRepository } from "../repositories/interfaces/IAppoinmentRepository.js";


@injectable()
export class BookSlotsService implements IBookSlotsService {
    constructor(@inject(TYPES.DoctorSlotRepository) private _doctorSlotRepo:IDoctorSlotRepository,@inject(TYPES.AppoinmentRepository)private _appoinmentRepo:IAppointentRepository){}

    /**
     * Retrieves available slots for a doctor on a specific date
     * @param doctorId - Doctor's ID
     * @param date - Date string to check availability
     * @returns Doctor slot info + success message
     */
    async getDoctorSlots(doctorId: string, date: string): Promise<{ doctorSlots: TDoctorSlotInfoDTO | null, message: string }> {

        const selectedDate = new Date(date)
        const weekDay = selectedDate.toLocaleDateString("en-US",{weekday:"long"}) as WeekDays 

        
        const slotDoc = await this._doctorSlotRepo.getSlotByDoctorId(doctorId);
        
        if (!slotDoc) {
             return { doctorSlots: null, message: DOCTOR_SLOT_MESSAGES.SLOT_NOT_FOUND };
        }

        // Check if day is enabled and not in unavailable dates
        const daySchedule = slotDoc.schedule[weekDay];
        const isUnavailable = slotDoc.unavailableDates?.includes(selectedDate.toDateString());

        if (!daySchedule?.enabled || isUnavailable) {
             // Return structure with empty slots if not available
            return { 
                doctorSlots: {
                    doctorId: doctorId,
                    slots: [],
                    slotDuration: slotDoc.slotDuration
                },
                message: DOCTOR_SLOT_MESSAGES.ALL_SLOTS_FETCH_SUCCESS 
            };
        }


        // 2. Fetch ALL appointments for this doctor on this date
        console.log("Doctor Id",doctorId,"date--->",selectedDate.toLocaleDateString())
        const existingAppointments = await this._appoinmentRepo.find(doctorId,selectedDate.toLocaleDateString())

        console.log("Existing details---------->",existingAppointments)

        // 3. Generate slots
        const generatedSlots = generateAvailableSlots(daySchedule, slotDoc.slotDuration, selectedDate);
        
        // 4. Update Status based on Appointments
        const finalSlots = generatedSlots.map(slot => {
            const isBooked = existingAppointments.some(app => {
                console.log("Appoinmentime--",app.appointmentTime,'--------',slot.time.split(',')[1])
              return  app.appointmentTime === slot.time.split(',')[1] &&
                ["BOOKED", "PENDING", "SUCCESS"].includes(app.status)
        });
            
            if (isBooked) {
                console.log("Isbookded one is ther---")
                return { ...slot, status: "booked" };
            }
            return slot;
        });

        const result: TDoctorSlotInfoDTO = {
            doctorId: doctorId,
            slots: finalSlots,
            slotDuration: slotDoc.slotDuration
        };

        return { doctorSlots: result, message: DOCTOR_SLOT_MESSAGES.ALL_SLOTS_FETCH_SUCCESS };
    }
}
