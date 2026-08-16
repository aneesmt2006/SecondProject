import { injectable, inject } from "inversify";
import type { IDoctorSlot } from "../utils/interface.utils.js";
import type { IDoctorSlotService } from "./interfaces/IDoctorSlotService.js";
import type { IDoctorSlotRepository } from "../repositories/interfaces/IDoctorSlotRepository.js";
import { TYPES } from "../types/type.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { DOCTOR_SLOT_MESSAGES } from "../constants/response-messages.constants.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";
import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import { getChannel, APPOINTMENT_EXCHANGE } from "../config/rabbitmq.config.js";
import logger from "../utils/logger.js";


@injectable()
export class DoctorSlotService implements IDoctorSlotService {
  constructor(
    @inject(TYPES.DoctorSlotRepository) private _doctorSlotRepository: IDoctorSlotRepository,
    @inject(TYPES.AppointmentRepository) private _appointmentRepo : IAppointentRepository
  ) {}

  /**
   * Creates or updates a doctor's slot configuration
   * @param data - Slot configuration data as IDoctorSlot
   * @returns Created/Updated slot DTO + success message
   */
  async createOrUpdateSlot(data: IDoctorSlot): Promise<{ slot: TDoctorSlotResponseDTO; message: string }> {
    logger.info("DoctorSlotService.createOrUpdateSlot hit", { doctorId: data.doctorId });

    const result = await this._doctorSlotRepository.createOrUpdateSlot(data);
    logger.info("Doctor slot updated successfully", { doctorId: result.doctorId });

    const formattedUnAvailableDates = result.unavailableDates.map((date) => new Date(date).toLocaleDateString("en-US"));
    const checkIsAppointInUnAvailable = await this._appointmentRepo.findConfirmAppointmentsByDate(data.doctorId, ['SUCCESS', 'BOOKED'], formattedUnAvailableDates);
    
    if (checkIsAppointInUnAvailable?.length) {
      const ids = checkIsAppointInUnAvailable.map((app) => String(app._id));
      await this._appointmentRepo.updateMany(ids, 'CANCELLED');
      
      const channel = getChannel();
      for (const app of checkIsAppointInUnAvailable) {
        const payload = {
            status: 'REFUNDED',
            eventType: 'PAYMENT_REFUNDED',
            appointmentId: app._id,
            appointmentDate: app.appointmentDate,
            appointmentTime: app.appointmentTime
        };
        channel.publish(APPOINTMENT_EXCHANGE, 'appointment.cancelled', Buffer.from(JSON.stringify(payload)));
      }
      logger.warn("Cancelled appointments that fell on newly unavailable dates", { cancelledCount: ids.length });
    }

    const mappedSlot = ResponseMapper.doctorSlotMapping(result);
    return { slot: mappedSlot, message: DOCTOR_SLOT_MESSAGES.SLOT_UPSERT_SUCCESS };
  }

  /**
   * Retrieves slot configuration by doctor ID
   * @param doctorId - Doctor's ID
   * @returns Slot DTO or null + success message
   */
  async getSlotByDoctorId(doctorId: string): Promise<{ slot: TDoctorSlotResponseDTO|null; message: string }> {
    const result = await this._doctorSlotRepository.getSlotByDoctorId(doctorId);
    if (!result) {
       return { slot: null, message: DOCTOR_SLOT_MESSAGES.SLOT_GET_SUCCESS };
    }
    const mappedSlot = ResponseMapper.doctorSlotMapping(result);

    return { slot: mappedSlot, message: DOCTOR_SLOT_MESSAGES.SLOT_GET_SUCCESS };
  }

  /**
   * Retrieves all doctor slot configurations
   * @returns Array of slot DTOs + success message
   */
  async getAllSlots(): Promise<{ slots: TDoctorSlotResponseDTO[]; message: string }> {
    const result = await this._doctorSlotRepository.getAllSlots();
    const mappedSlots = result.map(slot => ResponseMapper.doctorSlotMapping(slot));
    return { slots: mappedSlots, message: DOCTOR_SLOT_MESSAGES.ALL_SLOTS_FETCH_SUCCESS };
  }
}
