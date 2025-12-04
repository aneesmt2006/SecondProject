import { injectable, inject } from "inversify";
import type { IDoctorSlot } from "../utils/interface.utils.js";
import type { IDoctorSlotService } from "./interfaces/IDoctorSlotService.js";
import type { IDoctorSlotRepository } from "../repositories/interfaces/IDoctorSlotRepository.js";
import { TYPES } from "../types/type.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { DOCTOR_SLOT_MESSAGES } from "../constants/response-messages.constants.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";

@injectable()
export class DoctorSlotService implements IDoctorSlotService {
  constructor(
    @inject(TYPES.DoctorSlotRepository) private _doctorSlotRepository: IDoctorSlotRepository
  ) {}

  async createOrUpdateSlot(data: IDoctorSlot): Promise<{ slot: TDoctorSlotResponseDTO; message: string }> {
    console.log("SErvice hit ---->",data)
    const result = await this._doctorSlotRepository.createOrUpdateSlot(data);
    const mappedSlot = ResponseMapper.doctorSlotMapping(result);
    return { slot: mappedSlot, message: DOCTOR_SLOT_MESSAGES.SLOT_UPSERT_SUCCESS };
  }

  async getSlotByDoctorId(doctorId: string): Promise<{ slot: TDoctorSlotResponseDTO; message: string }> {
    const result = await this._doctorSlotRepository.getSlotByDoctorId(doctorId);
    if (!result) {
      throw new Error(DOCTOR_SLOT_MESSAGES.SLOT_NOT_FOUND);
    }
    const mappedSlot = ResponseMapper.doctorSlotMapping(result);
    return { slot: mappedSlot, message: DOCTOR_SLOT_MESSAGES.SLOT_GET_SUCCESS };
  }

  async getAllSlots(): Promise<{ slots: TDoctorSlotResponseDTO[]; message: string }> {
    const result = await this._doctorSlotRepository.getAllSlots();
    const mappedSlots = result.map(slot => ResponseMapper.doctorSlotMapping(slot));
    return { slots: mappedSlots, message: DOCTOR_SLOT_MESSAGES.ALL_SLOTS_FETCH_SUCCESS };
  }
}
