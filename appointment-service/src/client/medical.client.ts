// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../utils/api.response.utils.js";
import type { PatientDet } from "../utils/interface.utils.js";
import type CircuitBreaker from "opossum";
import { config } from "../config/env.config.js";
import { injectable } from "inversify";
import { createAxiosBreaker } from "../utils/circuitBreaker.js";

@injectable()
export class MedicalClient {
  private breaker: CircuitBreaker;

  constructor() {
    this.breaker = createAxiosBreaker("MedicalService");
  }

  async assingPrimaryDoctor(doctorId: string, userId: string) {
    return this.breaker.fire({
      method: "PUT",
      url: `${config.medicalServiceUrl}/patient/profile/primaryDoctor`,
      data: { doctorId },
      headers: {
        "x-token-id": userId,
        "x-token-role": "user",
      },
    });
  }

  async fetchPatientProfile(
    patientIds: string[],
    userId: string,
  ): Promise<ApiResponse<PatientDet[]>> {
    return this.breaker.fire({
      method: "POST",
      url: `${config.medicalServiceUrl}/patient/profile/forDoctors`,
      data: { patientIds },
      headers: {
        "x-token-id": userId,
        "x-token-role": "user",
      },
    }) as Promise<ApiResponse<PatientDet[]>>;
  }
}
