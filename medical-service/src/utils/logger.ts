import winston from "winston";
import LokiTransport from "winston-loki";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: { service: "medical-service" },
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
      host: process.env.LOKI_HOST || "http://localhost:3100",
      labels: { service: "medical-service" },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err: any) => console.error("Loki connection error:", err?.message || err)
    })
  ],
});

export default logger;
