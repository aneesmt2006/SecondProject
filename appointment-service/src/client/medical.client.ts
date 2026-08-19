import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "../utils/api.response.utils.js";
import type { PatientDet } from "../utils/interface.utils.js";
import CircuitBreaker from "opossum";
import axios from "axios";
import { config } from "../config/env.config.js";
import { injectable } from "inversify";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

@injectable()
export class MedicalClient {

    private breaker : CircuitBreaker;

    constructor(){

        this.breaker = new CircuitBreaker(
            this.request.bind(this),
            {
                timeout:5000,
                errorThresholdPercentage:50,
                resetTimeout:30000,
                volumeThreshold:5
            }
        )
        this.breaker.fallback(() => {
            throw new AppError(
                "Temporary service not available [Medical service]", 
                HTTP_STATUS.INTERNAL_SERVER_ERROR, 
                true
            );
        })
        this.registerEvents()
    }

     private registerEvents() {

        this.breaker.on("open", () => {
            logger.warn("[Medical Service] Circuit OPEN");
        });

        this.breaker.on("halfOpen", () => {
            logger.warn("[Medical Service] Circuit HALF OPEN");
        });

        this.breaker.on("close", () => {
            logger.info("[Medical Service] Circuit CLOSED");
        });

        this.breaker.on("success", () => {
            logger.info("[Medical Service] Request Success");
        });

        this.breaker.on("failure", (err) => {
            logger.error("[Medical Service] Request Failed", { error: err.message });
        });

        this.breaker.on("timeout", () => {
            logger.error("[Medical Service] Request Timed Out");
        });

        this.breaker.on("reject", () => {
            logger.warn("[Medical Service] Request Rejected (Circuit Open)");
        });

        this.breaker.on("fallback", (result) => {
            logger.warn("[Medical Service] Fallback Executed", { result });
        });
    }

    private async request(config:AxiosRequestConfig){
        return axios(config)
    }

    async assingPrimaryDoctor(doctorId:string,userId:string){
        return this.breaker.fire({
            method:'PUT',
            url: `${config.medicalServiceUrl}/patient/profile/primaryDoctor`,
            data: { doctorId },
            headers: {
                "x-token-id": userId,
                "x-token-role": "user"
            }
        })
    }

    async fetchPatientProfile(patientIds:string[],userId:string): Promise<AxiosResponse<ApiResponse<PatientDet[]>>>{
        return this.breaker.fire({
            method:'POST',
            url:`${config.medicalServiceUrl}/patient/profile/forDoctors`,
            data:{patientIds},
            headers:{
                "x-token-id": userId ,
                "x-token-role":"user"
            }
        }) as Promise<AxiosResponse<ApiResponse<PatientDet[]>>>
    }
}
