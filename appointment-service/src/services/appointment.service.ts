import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import type {
  IAppointment,
  PatientDet,
  IAdminDashboardStats,
  IBookingManagementStats,
  IDoctorDashboardStats,
} from "../utils/interface.utils.js";
import { inject, injectable } from "inversify";
import type { IAppointmentService } from "./interfaces/IAppointmentService.js";
import type {
  TApmntPatientsDetailsDTO,
  TCompleteAppointmentDTO,
  TCreateAppointmentDTO,
  TCreateAppointmentResponseDTO,
  TUserVisitHistoryDTO,
} from "../dtos/appointment.dto.js";
import { TYPES } from "../types/type.js";
import {
  COMMON_MESSAGE,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { getChannel, APPOINTMENT_EXCHANGE } from "../config/rabbitmq.config.js";
import { parseDate } from "../utils/date.utils.js";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLocked,
  isLockValid,
  lockSlot,
  releaseSlot,
} from "../utils/redis.worker.utils.js";
import { randomUUID } from "crypto";
import type { AuthClient } from "../client/auth.client.js";
import type { PaymentClient } from "../client/payment.client.js";
import type { MedicalClient } from "../client/medical.client.js";
import type { UserClient } from "../client/user.client.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@injectable()
export class AppointmentService implements IAppointmentService {
  constructor(
    @inject(TYPES.AppointmentRepository)
    private _appointmentRepo: IAppointentRepository,
    @inject(TYPES.MedicalClient) private _medicalClient: MedicalClient,
    @inject(TYPES.UserClient) private _userClient: UserClient,
    @inject(TYPES.AuthClient) private _authClient: AuthClient,
    @inject(TYPES.PaymentClient) private _paymentClient: PaymentClient,
  ) {}

  async create(
    appointment: TCreateAppointmentDTO,
  ): Promise<{ appointment: TCreateAppointmentResponseDTO; message: string }> {
    const isFirstBooking = await this._appointmentRepo.findByUserId(
      appointment.userId,
    );
    if (!isFirstBooking || isFirstBooking.length === 0) {
      await this._medicalClient.assingPrimaryDoctor(
        appointment.doctorId,
        appointment.userId,
      );
    }

    const randomId = randomUUID();

    const lockingSlot = await lockSlot(
      appointment.doctorId,
      appointment.appointmentDate,
      appointment.appointmentTime,
      randomId,
    );
    if (!lockingSlot) {
      throw new AppError(
        "The slot is booked already by someone, try another slot",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const appointmentData: IAppointment = {
      ...appointment,
      status: "PENDING",
      lockToken: randomId,
    };
    const appointmentDoc = await this._appointmentRepo.create(appointmentData);

    if (!appointmentDoc) {
      throw new AppError(
        ERROR_MESSAGE.DB_NOT_EXIST,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const mappedAppointment = ResponseMapper.appointmentMapper(appointmentDoc);
    return {
      appointment: mappedAppointment,
      message: SUCCESS_MESSAGE.APMNT_CREATED,
    };
  }

  async update(
    id: string,
    status: string,
  ): Promise<{ appointment: TCreateAppointmentResponseDTO; message: string }> {
    const existingApp = await this._appointmentRepo.findById(id);
    if (!existingApp)
      throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.NOT_FOUND);

    const validLock = await isLockValid(
      existingApp.doctorId,
      existingApp.appointmentDate,
      existingApp.appointmentTime,
      existingApp.lockToken,
    );

    // If the slot is already EXPIRED, or if we are trying to set SUCCESS (payment succeeded) but the lock expired (validLock is false)
    if (
      existingApp.status === "EXPIRED" ||
      (status === "SUCCESS" && existingApp.status === "PENDING" && !validLock)
    ) {
      const channel = getChannel();
      const payload = {
        status: "REFUNDED",
        eventType: "PAYMENT_REFUNDED",
        appointmentId: existingApp._id,
        appointmentDate: existingApp.appointmentDate,
        appointmentTime: existingApp.appointmentTime,
      };
      channel.publish(
        APPOINTMENT_EXCHANGE,
        "appointment.cancelled",
        Buffer.from(JSON.stringify(payload)),
      );

      // Ensure the DB status reflects that it's EXPIRED if it wasn't already
      if (existingApp.status === "PENDING") {
        await this._appointmentRepo.update(id, "EXPIRED");
      }

      throw new AppError(
        "Due to time expire, slot is booked by someone. Payment will refund",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updatedAppointment = await this._appointmentRepo.update(id, status);
    if (!updatedAppointment) {
      throw new AppError(
        ERROR_MESSAGE.DB_NOT_EXIST,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const mappedAppointment =
      ResponseMapper.appointmentMapper(updatedAppointment);

    if (mappedAppointment.status === "CANCELLED") {
      const channel = getChannel();
      const payload = {
        status: "REFUNDED",
        eventType: "PAYMENT_REFUNDED",
        appointmentId: mappedAppointment.appointmentId,
        appointmentDate: mappedAppointment.appointmentDate,
        appointmentTime: mappedAppointment.appointmentTime,
      };
      channel.publish(
        APPOINTMENT_EXCHANGE,
        "appointment.cancelled",
        Buffer.from(JSON.stringify(payload)),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    releaseSlot(
      updatedAppointment.doctorId,
      updatedAppointment.appointmentDate,
      updatedAppointment.appointmentTime,
      updatedAppointment.lockToken,
    );
    return {
      appointment: mappedAppointment,
      message: SUCCESS_MESSAGE.APMNT_UPDATED,
    };
  }

  async findAllDrappointments(
    doctorId: string,
    status?: string,
  ): Promise<{ patients: TApmntPatientsDetailsDTO[]; message: string }> {
    const now = new Date();

    const query: any = {
      doctorId,
    };

    if (status === "Completed") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.consultationStatus = "COMPLETED";
    } else if (status === "Cancelled") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.status = { $in: ["CANCELLED", "CANCELED", "REFUNDED"] };
    } else {
      // 'Upcoming', 'Expired', or default
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.status = { $in: ["SUCCESS", "BOOKED"] };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.consultationStatus = "PENDING";
    }

    const appointments =
      await this._appointmentRepo.getAllAppointmentsForDoctor(query);

    // console.log("DB response====> ",appointments)

    if (!appointments || appointments.length === 0) {
      return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
    }

    let filtered = appointments;
    if (status === "Expired") {
      filtered = appointments.filter(
        (a) =>
          now >=
          new Date(
            parseDate(a.appointmentDate, a.appointmentTime).getTime() +
              30 * 60 * 1000,
          ),
      );
    } else if (status === "Upcoming" || !status) {
      filtered = appointments.filter(
        (a) =>
          now <
          new Date(
            parseDate(a.appointmentDate, a.appointmentTime).getTime() +
              30 * 60 * 1000,
          ),
      );
    }

    filtered.sort(
      (a, b) =>
        parseDate(a.appointmentDate, a.appointmentTime).getTime() -
        parseDate(b.appointmentDate, b.appointmentTime).getTime(),
    );

    if (filtered.length === 0) {
      return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
    }

    const patientIds = filtered.map((apmnt) => apmnt.userId).filter(Boolean);

    console.log("Patient Ids==>", patientIds);

    let patientDetails: PatientDet[] = [];
    try {
      const response = await this._medicalClient.fetchPatientProfile(
        patientIds,
        doctorId,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((response as any).error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        throw new Error((response as any).message);
      }
      console.log("2");
      patientDetails = response.data || [];
    } catch (error: any) {
      logger.error("Medical service for patient details connecting Error:", {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
      });
      throw new AppError(
        "Failed to connect to medical service for patient details",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    console.log("3");

    if (patientDetails.length === 0) {
      return { patients: [], message: COMMON_MESSAGE.FETCH_SUCCESS };
    }

    const patientMap = new Map<string, PatientDet>();
    patientDetails.forEach((patient) =>
      patientMap.set(patient.userId, patient),
    );

    console.log("4");

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
        consultationStatus: apmnt.consultationStatus || "PENDING",
      };
    });

    console.log("Sending response is ====>", merged);
    return { patients: merged, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }

  async complete(data: TCompleteAppointmentDTO): Promise<{ message: string }> {
    const { appointmentId, notes } = data;

    const existingApmnt = await this._appointmentRepo.findById(appointmentId);
    if (!existingApmnt) {
      throw new AppError(ERROR_MESSAGE.DB_NOT_EXIST, HTTP_STATUS.NOT_FOUND);
    }

    await this._appointmentRepo.updateAppointment(appointmentId, {
      notes,
      consultationStatus: "COMPLETED",
    });

    return { message: SUCCESS_MESSAGE.APMNT_UPDATED };
  }

  async getUserVisitHistory(
    userId: string,
  ): Promise<{ history: TUserVisitHistoryDTO; message: string }> {
    const appointments = await this._appointmentRepo.findByUserId(userId);

    if (!appointments || appointments.length === 0) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        history: { upcoming: null as any, history: [] },
        message: COMMON_MESSAGE.FETCH_SUCCESS,
      };
    }

    const doctorIds = Array.from(new Set(appointments.map((a) => a.doctorId)));

    let doctorProfiles: any[] = [];
    try {
      doctorProfiles = await this._userClient.fetchDoctorProfiles(doctorIds);
    } catch (error: any) {
      logger.error("Failed to fetch doctor profiles for history", {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
      });
    }

    const doctorMap = new Map<string, any>();
    if (doctorProfiles) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      doctorProfiles.forEach((p) => doctorMap.set(p.doctorId, p));
    }

    const now = new Date();

    const mappedAppointments = appointments.map((apmnt) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dr = doctorMap.get(apmnt.doctorId);
      const appointmentDateObj = parseDate(
        apmnt.appointmentDate,
        apmnt.appointmentTime,
      );

      let status:
        | "Completed"
        | "Upcoming"
        | "Cancelled"
        | "Scheduled"
        | "Expired" = "Scheduled";
      if (apmnt.consultationStatus === "COMPLETED") {
        status = "Completed";
      } else if (
        apmnt.status === "CANCELLED" ||
        apmnt.status === "CANCELED" ||
        apmnt.status === "REFUNDED"
      ) {
        status = "Cancelled";
      } else if (
        appointmentDateObj > now ||
        now < new Date(appointmentDateObj.getTime() + 30 * 60 * 1000)
      ) {
        status = "Upcoming";
      } else if (appointmentDateObj) {
        status = "Expired";
      }

      return {
        appointmentId: apmnt._id!,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        doctorName: dr?.fullName || "Doctor",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        specialization: dr?.specialization || "General Consultation",
        appointmentDate: apmnt.appointmentDate,
        appointmentTime: apmnt.appointmentTime,
        reason: "General Consultation",
        notes: apmnt.notes,
        status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        doctorImage: dr?.profileImageLink,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        hospitalName: dr?.clinicName || "Clinic",
      };
    });

    mappedAppointments.sort((a, b) => {
      return (
        parseDate(b.appointmentDate, b.appointmentTime).getTime() -
        parseDate(a.appointmentDate, a.appointmentTime).getTime()
      );
    });

    const upcomingList = mappedAppointments
      .filter((a) => a.status === "Upcoming")
      .sort(
        (a, b) =>
          parseDate(a.appointmentDate, a.appointmentTime).getTime() -
          parseDate(b.appointmentDate, b.appointmentTime).getTime(),
      );

    const upcoming = upcomingList.length > 0 ? upcomingList[0] : null;
    const history = mappedAppointments.filter((a) => a !== upcoming);

    return {
      history: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        upcoming: upcoming as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        history: history as any[],
      },
      message: COMMON_MESSAGE.FETCH_SUCCESS,
    };
  }

  async findMainDoctor(
    userId: string,
  ): Promise<{ doctorId: string; message: string }> {
    const mainDoctor = await this._appointmentRepo.findByUserId(userId);
    const doctorId = mainDoctor[0]?.doctorId;

    if (!doctorId) {
      throw new AppError("No main doctor found", HTTP_STATUS.NOT_FOUND);
    }

    return { doctorId, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }

  async getAdminDashboardStats(
    period: "daily" | "monthly" | "yearly",
    role?: string,
    userId?: string,
  ): Promise<{ stats: IAdminDashboardStats; message: string }> {
    // Prepare headers to forward auth context
    const headers: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (role) headers["x-token-role"] = role;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (userId) headers["x-token-id"] = userId;

    // Fetch local data
    const upcomingAppointments =
      await this._appointmentRepo.getUpcomingAppointmentsCount();
    const topDoctors = await this._appointmentRepo.getTopDoctors(5);

    // Fetch remote data via dedicated clients
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const authPromise = this._authClient
      .getDashboardStats(headers)
      .catch(() => ({ error: true })) as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const paymentPromise = this._paymentClient
      .getDashboardStats(period, headers)
      .catch(() => ({ error: true })) as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const authDoctorsPromise = this._authClient
      .getAllDoctors(headers)
      .catch(() => ({ error: true })) as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [authRes, paymentRes, authDoctorsRes] = await Promise.all([
      authPromise,
      paymentPromise,
      authDoctorsPromise,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const totalRegisteredWomen = authRes?.error
      ? 0
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        authRes?.data?.totalPatients || 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const pendingDoctorApprovals = authRes?.error
      ? 0
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        authRes?.data?.pendingDoctors || 0;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const totalRevenue = paymentRes?.error
      ? 0
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        paymentRes?.data?.totalRevenue || 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const revenueOverview = paymentRes?.error
      ? []
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        paymentRes?.data?.revenueOverview || [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const allDoctors = authDoctorsRes?.error ? [] : authDoctorsRes?.data || [];

    // Map top doctors with real names
    const enrichedTopDoctors = topDoctors.map((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const found = allDoctors.find(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (d: any) => d.id === doc.id || d._id === doc.id,
      );
      return {
        ...doc,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        name: found ? found.fullName : doc.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        specialty: found ? found.specialization : doc.specialty,
      };
    });

    const stats = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      totalRegisteredWomen,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      pendingDoctorApprovals,
      upcomingAppointments,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      totalRevenue,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      revenueOverview,
      topDoctors: enrichedTopDoctors,
    };

    return { stats, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }

  async getAdminAppointmentsList(
    page: number,
    limit: number,
    filter: any = {},
  ): Promise<{
    appointments: any[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
    message: string;
  }> {
    const { data, total } = await this._appointmentRepo.findAdminList(
      page,
      limit,
      filter,
    );

    const mappedAppointments = data.map((apmnt) => ({
      bookingId: apmnt._id ? apmnt._id.toString().substring(0, 8) : "",
      apmntId: apmnt._id,
      userId: apmnt.userId,
      doctorId: apmnt.doctorId,
      appointmentDate: apmnt.appointmentDate,
      appointmentTime: apmnt.appointmentTime,
      status: apmnt.status,
      consultationStatus: apmnt.consultationStatus,
      amount: apmnt.amount,
      isRecurring: apmnt.isRecurring,
      notes: apmnt.notes,
    }));

    return {
      appointments: mappedAppointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCount: total,
      message: COMMON_MESSAGE.FETCH_SUCCESS,
    };
  }

  async getBookingManagementStats(): Promise<{
    stats: IBookingManagementStats;
    message: string;
  }> {
    const stats = await this._appointmentRepo.findAdminStats();

    // Extract values from facet array outputs (or default to 0)
    const formatStat = (field: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      field && field.length > 0 ? field[0].count : 0;

    const formattedStats = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      totalBookings: formatStat(stats.totalBookings),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      todayBookings: formatStat(stats.todayBookings),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      upcoming: formatStat(stats.upcoming),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      completed: formatStat(stats.completed),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cancelled: formatStat(stats.cancelled),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      refunded: formatStat(stats.refunded),
    };

    return { stats: formattedStats, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }

  async getDoctorDashboardStats(
    doctorId: string,
  ): Promise<{ stats: IDoctorDashboardStats; message: string }> {
    const { todayAppointments, rawUpcoming, totalPatients } =
      await this._appointmentRepo.getDoctorDashboardStats(doctorId);

    let upcomingCount = 0;
    const now = new Date();
    for (const apmnt of rawUpcoming) {
      const apmntDateObj = parseDate(
        apmnt.appointmentDate,
        apmnt.appointmentTime,
      );
      // Allow 30 minute buffer after appointment time before considering it expired
      if (apmntDateObj.getTime() + 30 * 60 * 1000 > now.getTime()) {
        upcomingCount++;
      }
    }

    const stats: IDoctorDashboardStats = {
      todayAppointments,
      upcomingAppointments: upcomingCount,
      totalPatients,
    };

    return { stats, message: COMMON_MESSAGE.FETCH_SUCCESS };
  }
}
