
import winston from "winston";
import LokiTransport from "winston-loki";
import { config } from "./env.js";

const logger = winston.createLogger({
  level: config.logLevel|| "debug",
  defaultMeta: { service: config.service },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, service }) => {
      return `[${timestamp}] [${level}] [${service}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // logs to terminal
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // errors → error.log
    new winston.transports.File({ filename: "logs/combined.log" }), // all logs → combined.log
    // new LokiTransport({
    //   host: "http://loki:3100",
    //   labels: { service: config.service || 'api-gateway' },
    //   json: true,
    //   replaceTimestamp: true,
    //   onConnectionError: (err) => console.error(err)
    // })
  ],
});


export default logger








// import winston from "winston";
// import dotenv from "dotenv";

// import fs from 'fs'




// const logDir = '/logs';

// export const logger = winston.createLogger({
//   level: config.logLevel || "debug",
//   defaultMeta: { service: config.service },
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.colorize(),
//     winston.format.printf(({ level, message, timestamp, service }) => {
//       return `logger  - [${timestamp}] [${level}] [${service}]: ${message}`;
//     })
//   ),
//   transports:[
//    new winston.transports.Console({
//         format:winston.format.combine(
//             winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
//             winston.format.align(),
//             winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
//         )}),
//   ]
// });

// if ( fs.existsSync( logDir ) ) {
//   logger.add(
//     new winston.transports.File({
//       filename: '/logs/server.log',
//       format:winston.format.combine(
//           winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
//           winston.format.align(),
//           winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
//       )}),
//   ) 
// }

// export default logger
