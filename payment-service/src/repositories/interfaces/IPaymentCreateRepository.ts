import type {
  IPaymentOrder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IRevenueOverviewItem,
} from "../../utils/interface.utils.js";

export interface IPaymentRepository {
  create(payment: IPaymentOrder): Promise<IPaymentOrder>;
  update(
    orderCreationId: string,
    status: string,
    razorpayPaymentId: string,
  ): Promise<IPaymentOrder | null>;
  findByAppoinmentId(appoinmentId: string): Promise<IPaymentOrder | null>;
  getTotalRevenue(startDate: Date): Promise<number>;
  getRevenueByPeriod(
    startDate: Date,
    groupByFormat: "daily" | "monthly" | "yearly",
  ): Promise<{ _id: number; total: number }[]>;
}
