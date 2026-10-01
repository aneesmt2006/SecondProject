import type CircuitBreaker from "opossum";
import { config } from "../config/env.config.js";
import { injectable } from "inversify";
import { createAxiosBreaker } from "../utils/circuitBreaker.js";

@injectable()
export class PaymentClient {
  private breaker: CircuitBreaker;

  constructor() {
    this.breaker = createAxiosBreaker("PaymentService");
  }

  async getDashboardStats(period: string, headers: any) {
    return this.breaker.fire({
      method: "GET",
      url: `${config.paymentServiceUrl}/create/internal/dashboard-stats?period=${period}`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers,
      timeout: 5000,
    });
  }
}
