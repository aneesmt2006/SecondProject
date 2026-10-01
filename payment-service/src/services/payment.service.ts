import logger from "../utils/logger.js";
import { inject, injectable } from "inversify";
import type { IPaymentService } from "./interfaces/IPaymentService.js";
import { TYPES } from "../types/type.js";
import type { IPaymentRepository } from "../repositories/interfaces/IPaymentCreateRepository.js";
import type { IPaymentAdminDashboardStats } from "../utils/interface.utils.js";
import type {
  TPaymentCreateDTO,
  TPaymentCreateResponseDTO,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TPaymentUpdateDTO,
} from "../dtos/payment.dto.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Razorpay from "razorpay";
import { config } from "../config/env.config.js";
import { generateTempOrderId } from "../utils/tempOrderId.utils.js";
import {
  PAYMENT_ERRORS,
  PAYMENT_SUCCESS,
} from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import type { TPaymentVerifyDTO } from "../dtos/payment.dto.js";
import * as crypto from "crypto";
import { publishEvent } from "../config/rabbitmq.config.js";
import { RazorpayInstance } from "../config/razorpay.instance.config.js";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.PaymentRespository) private _paymentRepo: IPaymentRepository,
  ) {}

  /**
   * Creates a new payment order via Razorpay
   * @param payment - Payment creation details
   * @returns Payment DTO + success message
   */
  async create(
    payment: TPaymentCreateDTO,
  ): Promise<{ payment: TPaymentCreateResponseDTO; message: string }> {
    const instance = RazorpayInstance;

    const tempOrderId = generateTempOrderId();

    const options = {
      amount: payment.amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: tempOrderId,
    };

    const razorOrder = await instance.orders.create(options);

    if (!razorOrder) throw new Error(PAYMENT_ERRORS.FAILED_CREATE_ORDER);

    const paymentDoc = await this._paymentRepo.create({
      tempOrderId: tempOrderId,
      razorpayOrderId: razorOrder.id,
      userId: payment.userId,
      doctorId: payment.doctorId,
      amount: payment.amount,
      appoinmentId: payment.appoinmentId,
      status: "PENDING",
    });
    logger.info("PAyment DOc----->", paymentDoc);

    if (!paymentDoc) throw new Error(PAYMENT_ERRORS.FAILED_DB);

    const mappedPayment = ResponseMapper.PaymentMapper(
      paymentDoc,
      config.razorpayKeyId as string,
    );
    return {
      payment: mappedPayment,
      message: PAYMENT_SUCCESS.CREATE_ORDER_SUCCESS,
    };
  }

  /**
   * Verifies Razorpay payment signature
   * @param payment - Verification DTO with signature details
   * @returns Verification status + success message
   */
  async verify(
    payment: TPaymentVerifyDTO,
  ): Promise<{ status: boolean; message: string }> {
    const {
      orderCreationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = payment;

    logger.info("From verify payment ????");

    const shasum = crypto
      .createHmac("sha256", config.razorpaySecret!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    //comparing our digest with actual one
    if (digest !== razorpaySignature) {
      throw new Error(PAYMENT_ERRORS.SIGNATURE_NOT_MATCHING);
    }

    const paymentDoc = await this._paymentRepo.update(
      orderCreationId,
      "SUCCESS",
      razorpayPaymentId,
    );

    if (!paymentDoc) throw new Error(PAYMENT_ERRORS.FAILED_DB);

    await publishEvent("payment.success", {
      status: "SUCCESS",
      eventType: "PAYMENT_SUCCESS",
      paymentId: paymentDoc._id,
      appointmentId: paymentDoc.appoinmentId,
      userId: paymentDoc.userId,
      doctorId: paymentDoc.doctorId,
      amount: paymentDoc.amount,
      paidAt: new Date().toISOString(),
    });

    return {
      status: true,
      message: PAYMENT_SUCCESS.PAYMNET_VERIFICATION_SUCCESS,
    };
  }

  /**
   * Processes a refund for an appointment
   * @param appoinmentId - Appointment ID
   * @param status - Status to update to (e.g., REFUNDED)
   * @param appoinmentDate - Date of appointment
   * @param appoinmentTime - Time of appointment
   * @returns Refund status + success message
   */
  async refund(
    appoinmentId: string,
    status: string,
    appoinmentDate: string,
    appoinmentTime: string,
  ): Promise<{ status: boolean; message: string }> {
    const appoinment = await this._paymentRepo.findByAppoinmentId(appoinmentId);
    if (!appoinment) throw new Error(PAYMENT_ERRORS.NOT_CONTAIN);

    if (appoinment.status === "REFUNDED") {
      logger.info(
        `Refund already processed for this appointment ${appoinment.appoinmentId}`,
      );
      return { status: true, message: "Already refunded" };
    }
    const instance = RazorpayInstance;
    const { amount, razorpayPaymentId, tempOrderId } = appoinment;

    if (!razorpayPaymentId) {
      throw new Error(
        "No successful payment record found for this appointment to refund.",
      );
    }

    const refundRazorpay = await instance.payments.refund(razorpayPaymentId, {
      amount: amount * 100,
    });

    if (!refundRazorpay) throw new Error("Error while refund razorapy");

    const updated = await this._paymentRepo.update(
      tempOrderId!,
      status,
      razorpayPaymentId,
    );

    if (!updated) throw new Error(PAYMENT_ERRORS.FAILED_DB);

    const payload = {
      pattern: "payment.refunded",
      data: {
        userId: updated.userId,
        doctorId: updated.doctorId,
        appoinmentTime: appoinmentTime,
        appoinmentDate: appoinmentDate,
        appoinmentId: appoinmentId,
      },
    };

    logger.info(
      "Publishing refund event with payload:",
      JSON.stringify(payload, null, 2),
    );

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    publishEvent("payment.refunded", payload);

    logger.info("Now we can inform Notiii kutaaa");

    return { status: true, message: PAYMENT_SUCCESS.REFUND_SUCCESS };
  }

  async getAdminDashboardStats(
    period: "daily" | "monthly" | "yearly",
  ): Promise<{ stats: IPaymentAdminDashboardStats; message: string }> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

    const totalRevenue = await this._paymentRepo.getTotalRevenue(startOfYear);

    let revenueOverview: any[] = [];

    if (period === "monthly") {
      const rawData = await this._paymentRepo.getRevenueByPeriod(
        startOfYear,
        "monthly",
      );
      const monthsMap = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      revenueOverview = monthsMap.map((label, index) => {
        const match = rawData.find((r) => r._id === index + 1);
        return { label, amount: match ? match.total : 0 };
      });
    } else if (period === "yearly") {
      const startOf5YearsAgo = new Date(
        `${currentYear - 4}-01-01T00:00:00.000Z`,
      );
      const rawData = await this._paymentRepo.getRevenueByPeriod(
        startOf5YearsAgo,
        "yearly",
      );
      for (let i = currentYear - 4; i <= currentYear; i++) {
        const match = rawData.find((r) => r._id === i);
        revenueOverview.push({
          label: String(i),
          amount: match ? match.total : 0,
        });
      }
    } else {
      const startOfWeek = new Date();
      startOfWeek.setDate(
        startOfWeek.getDate() -
          startOfWeek.getDay() +
          (startOfWeek.getDay() === 0 ? -6 : 1),
      );
      startOfWeek.setHours(0, 0, 0, 0);
      const rawData = await this._paymentRepo.getRevenueByPeriod(
        startOfWeek,
        "daily",
      );
      const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const rawOverview = daysMap.map((label, index) => {
        const dbDayId = index === 0 ? 1 : index + 1;
        const match = rawData.find((r) => r._id === dbDayId);
        return { label, amount: match ? match.total : 0 };
      });
      revenueOverview = [...rawOverview.slice(1), rawOverview[0]];
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stats: { totalRevenue, revenueOverview },
      message: "Payment dashboard stats fetched successfully",
    };
  }
}
