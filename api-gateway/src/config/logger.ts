import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import LokiTransport from 'winston-loki';
import { config } from './env.js';

const { combine, timestamp, printf, json, errors } = winston.format;

// Console only — colorize must not reach file or Loki transports
const consoleFormat = combine(
  winston.format.colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, service, requestId }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    return `[${timestamp}]${rid} [${level}] [${service}]: ${message}`;
  })
);

// Structured JSON for file and Loki transports
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  defaultMeta: { service: config.service },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),

    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),

    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),

    new LokiTransport({
      host: 'http://loki:3100',
      labels: { service: config.service || 'api-gateway' },
      json: true,
      format: fileFormat,
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('[Loki transport error]', err),
    }),
  ],
});

export default logger;
