import { inject, injectable } from "inversify";
import type { IBookedDoctorsService } from "./interfaces/IBookedDoctorsService.js";
import type { TBookedDoctors, TBookedPatients } from "../dtos/appointment.dto.js";
import { TYPES } from "../types/type.js";
import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { COMMON_MESSAGE } from "../constants/common-response.constants.js";
import type { UserClient } from "../client/user.client.js";
import type { MedicalClient } from "../client/medical.client.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@injectable()
export class BookedDoctorsService implements IBookedDoctorsService {
  constructor(
    @inject(TYPES.AppointmentRepository) private readonly _apmntRepo: IAppointentRepository,
    @inject(TYPES.UserClient) private readonly _userClient: UserClient,
    @inject(TYPES.MedicalClient) private readonly _medicalClient: MedicalClient
  ) {}

  async bookedDoctors(userId: string): Promise<{ bookedDoctors: TBookedDoctors[] | null, message: string }> {
      const bookedApmnts = await this._apmntRepo.findByUserId(userId);
      const doctorIds = [...new Set(bookedApmnts.map(apmnt => apmnt.doctorId))];
      
      if (!doctorIds || doctorIds.length === 0) {
          return { bookedDoctors: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
      }

      let doctorProfilesFromApmntservice: any[] = [];
      try {
          doctorProfilesFromApmntservice = await this._userClient.fetchDoctorProfiles(doctorIds);
      } catch (error: any) {
          logger.error("Failed to fetch doctor profiles for booked doctors", { error: error.message });
          throw new AppError("Error while connecting to Users Management service", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
      
      const drProfileData = doctorProfilesFromApmntservice.map((dr) => ResponseMapper.doctorProfileForUserChatMapping(dr));

      return { bookedDoctors: drProfileData, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }

  async bookedPatients(doctorId: string): Promise<{ bookedPatients: TBookedPatients[] | null; message: string; }> {
      const bookedApmnts = await this._apmntRepo.findByDoctorId(doctorId);
      const patientIds = [...new Set(bookedApmnts?.map(apmnt => apmnt.userId))];

      if (!patientIds || patientIds.length === 0) {
          return { bookedPatients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
      }

      let patientProfilesFromMedicalService: any[] = [];
      try {
          const response = await this._medicalClient.fetchPatientProfile(patientIds, doctorId);
          patientProfilesFromMedicalService = response.data?.data || [];
      } catch (error: any) {
          logger.error("Failed to fetch patient profiles for booked patients", { error: error.message });
          throw new AppError("Failed to fetch patient profiles", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      const mappedPatients: TBookedPatients[] = patientProfilesFromMedicalService.map((patient: any) => ({
          id: patient.userId,
          name: patient.fullName
      }));

      return { bookedPatients: mappedPatients, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }
}
