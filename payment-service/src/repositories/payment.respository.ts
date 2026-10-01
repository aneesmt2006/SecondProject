import { injectable } from "inversify";
import type { IPaymentRepository } from "./interfaces/IPaymentCreateRepository.js";
import type {
  IPaymentOrder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IPaymentAdminDashboardStats,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IRevenueOverviewItem,
} from "../utils/interface.utils.js";
import { PaymentOrderModel } from "../models/booking.payment.model.js";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  async create(payment: IPaymentOrder): Promise<IPaymentOrder> {
    return await PaymentOrderModel.create(payment);
  }

  async update(
    orderCreationId: string,
    status: string,
    razorpayPaymentId: string,
  ): Promise<IPaymentOrder | null> {
    return await PaymentOrderModel.findOneAndUpdate(
      { tempOrderId: orderCreationId },
      { $set: { status: status, razorpayPaymentId: razorpayPaymentId } },
      { new: true },
    );
  }

  async findByAppoinmentId(
    appoinmentId: string,
  ): Promise<IPaymentOrder | null> {
    return await PaymentOrderModel.findOne({ appoinmentId });
  }

  async getTotalRevenue(startDate: Date): Promise<number> {
    const totalRevenueResult = await PaymentOrderModel.aggregate([
      { $match: { status: "SUCCESS", createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
  }

  async getRevenueByPeriod(
    startDate: Date,
    groupByFormat: "daily" | "monthly" | "yearly",
  ): Promise<{ _id: number; total: number }[]> {
    let groupStage;
    if (groupByFormat === "monthly") {
      groupStage = { $month: "$createdAt" };
    } else if (groupByFormat === "yearly") {
      groupStage = { $year: "$createdAt" };
    } else {
      groupStage = { $dayOfWeek: "$createdAt" };
    }

    return await PaymentOrderModel.aggregate([
      { $match: { status: "SUCCESS", createdAt: { $gte: startDate } } },
      { $group: { _id: groupStage, total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);
  }
}
