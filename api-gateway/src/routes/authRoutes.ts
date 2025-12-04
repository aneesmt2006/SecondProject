import { Router, type Request } from "express";
import { ServiceProxy } from "../services/ProxyService.js";
import { withAuth } from "../middlewares/auth.js";
import { config } from "../config/env.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const proxyService = new ServiceProxy();

console.log("env of user", config.usersManagementServiceUrl);

router.use(
  "/account",withAuth,
  proxyService.createProxy({
    target: (config.authServiceUrl as string) || "http://localhost:3001",
    pathRewrite: { "^/api/v1/account": "" },
    serviceName: "auth-service",
  })
);

router.use(
  "/users",withAuth,
  proxyService.createProxy({
    target: (config.usersManagementServiceUrl as string) || "http://localhost:3002",
    pathRewrite: { "/api/v1/users": "" },
    serviceName: "users-management-service",
  })
);


router.use(
  "/medical",withAuth,
  proxyService.createProxy({
    target: (config.medicalServiceUrl as string) || "http://localhost:3003",
    pathRewrite: { "/api/v1/medical": "" },
    serviceName: "medical-service",
  })
);
export default router;
