import type { Secret, SignOptions } from "jsonwebtoken";
import { config } from "./env.config.js";

type jwtExpiresIn = SignOptions["expiresIn"];

interface Config {
  env: typeof config;
  jwtSecret: Secret;
  jwtExpiresIn: jwtExpiresIn;
}     

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const configs:Config = {
  env: config,
  jwtExpiresIn: config.jwtExpiresIn as jwtExpiresIn,
  jwtSecret: config.jwtSecret as string,
};
