import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import CircuitBreaker from "opossum";
import { config } from "../config/env.config.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { injectable } from "inversify";

@injectable()
export class UserClient {
    private breaker: CircuitBreaker;

    constructor() {
        this.breaker = new CircuitBreaker(
            this.request.bind(this),
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                volumeThreshold: 5
            }
        );

        this.breaker.fallback(() => {
            throw new AppError(
                "Temporary service not available [User Management Service]", 
                HTTP_STATUS.INTERNAL_SERVER_ERROR, 
                true
            );
        });

        this.registerEvents();
    }

    private registerEvents() {
        this.breaker.on("open", () => {
            logger.warn("[UserClient] Circuit OPEN");
        });

        this.breaker.on("halfOpen", () => {
            logger.warn("[UserClient] Circuit HALF OPEN");
        });

        this.breaker.on("close", () => {
            logger.info("[UserClient] Circuit CLOSED");
        });

        this.breaker.on("success", () => {
            logger.info("[UserClient] Request Success");
        });

        this.breaker.on("failure", (err) => {
            logger.error("[UserClient] Request Failed", { error: err.message });
        });

        this.breaker.on("timeout", () => {
            logger.error("[UserClient] Request Timed Out");
        });

        this.breaker.on("reject", () => {
            logger.warn("[UserClient] Request Rejected (Circuit Open)");
        });

        this.breaker.on("fallback", (result) => {
            logger.warn("[UserClient] Fallback Executed", { result });
        });
    }

    private async request(axiosConfig: AxiosRequestConfig) {
        return axios(axiosConfig);
    }

    /**
     * Fetches doctor profiles based on an array of doctor IDs
     */
    async fetchDoctorProfiles(doctorIds: string[]): Promise<any[]> {
        if (!doctorIds || doctorIds.length === 0) return [];
        
        try {
            const response = await this.breaker.fire({
                method: 'POST',
                url: `${config.usersManagementServiceUrl}/doctor/profile/forAppointments`,
                data: { doctorIds }
            }) as AxiosResponse;
            
            return response.data?.data || [];
        } catch (error: any) {
            // If the circuit is open, the fallback will throw the AppError.
            // If the circuit is closed but the request fails, we throw here.
            if (error instanceof AppError) throw error;
            
            throw new AppError(
                "Failed to fetch doctor profiles from User Management Service",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                true // operational error because we anticipate network failures
            );
        }
    }
}
