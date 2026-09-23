import type CircuitBreaker from "opossum";
import { config } from "../config/env.config.js";
import { injectable } from "inversify";
import { createAxiosBreaker } from "../utils/circuitBreaker.js";

@injectable()
export class AuthClient {
    private breaker: CircuitBreaker;

    constructor() {
        this.breaker = createAxiosBreaker("AuthService");
    }

    async getDashboardStats(headers: any) {
        return this.breaker.fire({
            method: 'GET',
            url: `${config.authServiceUrl}/auth/admin/internal/dashboard-stats`,
            headers,
            timeout: 5000
        });
    }

    async getAllDoctors(headers: any) {
        return this.breaker.fire({
            method: 'GET',
            url: `${config.authServiceUrl}/auth/admin/getAllDoctors`,
            headers,
            timeout: 9000
        });
    }
}
