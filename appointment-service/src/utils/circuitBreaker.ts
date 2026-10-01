import CircuitBreaker from "opossum";
import axios, { type AxiosRequestConfig } from "axios";
import logger from "./logger.js";

const breakerOptions = {
  timeout: 3000, // If function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 30000, // After 30 seconds, try again
};

/**
 * Creates an Axios circuit breaker wrapper for internal HTTP calls
 * @param serviceName - Used for logging purposes
 */
export function createAxiosBreaker(serviceName: string) {
  const action = async (config: AxiosRequestConfig) => {
    const response = await axios(config);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  };

  const breaker = new CircuitBreaker(action, breakerOptions);

  breaker.fallback((config: AxiosRequestConfig, error: any) => {
    logger.error(
      `Circuit breaker fallback triggered for ${serviceName} on ${config.url}`,
      error,
    );
    return { error: true, message: `${serviceName} is currently unavailable` };
  });

  breaker.on("open", () =>
    logger.warn(`Circuit breaker opened for ${serviceName}`),
  );
  breaker.on("halfOpen", () =>
    logger.warn(`Circuit breaker half-open for ${serviceName}`),
  );
  breaker.on("close", () =>
    logger.info(`Circuit breaker closed for ${serviceName}`),
  );

  return breaker;
}
