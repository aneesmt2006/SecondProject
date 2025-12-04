import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

const PUBLIC_ENDPOINTS = [
  "/api/v1/account/auth/register",
  "/api/v1/account/auth/login",
  "/api/v1/account/auth/refresh",
  "/api/v1/account/auth/google",
  "/api/v1/account/auth/verify-otp",
  "/api/v1/account/auth/dr/register",
  "/api/v1/account/auth/dr/verify-otp",
  "/api/v1/account/auth/dr/login",
  "/api/v1/account/auth/admin/login",
  "/api/v1/account/auth/admin/getAllUsers"

];

export const withAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Allow public routes
    if (PUBLIC_ENDPOINTS.some((path) => req.originalUrl.includes(path))) {
      return next();
    }

    const authHeader = req.headers["authorization"];
    console.log(req.headers)
    if (!authHeader) {
      logger.warn("Unauthorized - Missing Authorization Header");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Tokennn auth header ",authHeader)
    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn("Unauthorized - Bearer Token Missing");
      return res.status(401).json({ message: "Unauthorized" });
    }
   
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      role: string;
    };

    // Attach user to request
    
    req.headers['x-token-id'] = decoded.id
    req.headers['x-token-role'] = decoded.role

    console.log("User id decoded",decoded)

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
