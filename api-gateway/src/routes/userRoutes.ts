import { Router, type Request } from "express";
import { ServiceProxy } from "../services/ProxyService.js";
import { authenticate } from "../middlewares/auth.js";
import { config } from "../config/env.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const proxyService = new ServiceProxy();

console.log("env of user", config.userServiceUrl);

router.use(
  "/user",
  (req, res, next) => {
    console.log("🔍 Before proxy:");
    console.log("  Original URL:", req.originalUrl);
    console.log("  Path:", req.path);
    console.log("  Target:", config.userServiceUrl);
    next();
  },
  proxyService.createProxy({
    target: (config.userServiceUrl as string) || "http://localhost:3001",
    pathRewrite: { "^/api/v1/user": "" },
    serviceName: "user-service",
    onProxyReq: (proxyReq:any, req:Request) => {
      console.log("📤 Proxying to:", proxyReq.path);
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
    },
  })
);
export default router;
