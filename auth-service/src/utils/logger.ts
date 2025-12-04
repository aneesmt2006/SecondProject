import winston from "winston";
import LokiTransport from "winston-loki";
import { config } from "../config/env.config.js";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: { service: "auth-service" },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new LokiTransport({
      host: "http://loki:3100",
      labels: { service: "auth-service" },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err)
    })
  ],
});

export default logger;
