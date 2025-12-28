import { Router, type Request } from "express";
import { ServiceProxy } from "../services/ProxyService.js";
import { withAuth } from "../middlewares/auth.js";
import { config } from "../config/env.js";
import dotenv from "dotenv";
import { SERVICE_ROUTES } from "../constants/routes.constants.js";
dotenv.config();

const router = Router();
const proxyService = new ServiceProxy();

console.log("env of user", config.usersManagementServiceUrl);

router.use(
  SERVICE_ROUTES.ACCOUNT.PATH,withAuth,
  proxyService.createProxy({
    target: (config.authServiceUrl as string) || "http://localhost:3001",
    pathRewrite: { [SERVICE_ROUTES.ACCOUNT.REWRITE]: "" },
    serviceName: SERVICE_ROUTES.ACCOUNT.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.USERS.PATH,withAuth,
  proxyService.createProxy({
    target: (config.usersManagementServiceUrl as string) || "http://localhost:3002",
    pathRewrite: { [SERVICE_ROUTES.USERS.REWRITE]: "" },
    serviceName: SERVICE_ROUTES.USERS.SERVICE_NAME,
  })
);


router.use(
  SERVICE_ROUTES.MEDICAL.PATH,withAuth,
  proxyService.createProxy({
    target: (config.medicalServiceUrl as string) || "http://localhost:3003",
    pathRewrite: { [SERVICE_ROUTES.MEDICAL.REWRITE]: "" },
    serviceName: SERVICE_ROUTES.MEDICAL.SERVICE_NAME,
  })
);

router.use(SERVICE_ROUTES.PAYMENT.PATH,withAuth,proxyService.createProxy({
  target:(config.paymentServiceUrl as string) || "http://localhost:3012",
  pathRewrite:{[SERVICE_ROUTES.PAYMENT.REWRITE]:""},
  serviceName:SERVICE_ROUTES.PAYMENT.SERVICE_NAME
}))

router.use(SERVICE_ROUTES.APPOINTMENT.PATH,withAuth,proxyService.createProxy({
  target:(config.appoinmentServiceUrl as string),
  pathRewrite:{[SERVICE_ROUTES.APPOINTMENT.REWRITE]:""},
  serviceName:SERVICE_ROUTES.APPOINTMENT.SERVICE_NAME
}))

router.use(SERVICE_ROUTES.TRACKING.PATH,withAuth,proxyService.createProxy({
  target:(config.trackingServiceurl as string),
  pathRewrite:{[SERVICE_ROUTES.TRACKING.REWRITE]:''},
  serviceName:SERVICE_ROUTES.TRACKING.SERVICE_NAME
}))
export default router;
