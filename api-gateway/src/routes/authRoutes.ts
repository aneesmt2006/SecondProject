import { Router } from 'express';
import { ServiceProxy } from '../services/ProxyService.js';
import { withAuth } from '../middlewares/auth.js';
import { authLimiter, strictLimiter } from '../middlewares/rateLimiter.js';
import { config } from '../config/env.js';
import { SERVICE_ROUTES } from '../constants/routes.constants.js';

const router = Router();
const proxyService = new ServiceProxy();

// authLimiter runs before withAuth — stops brute-force before JWT verification
router.use(
  SERVICE_ROUTES.ACCOUNT.PATH,
  authLimiter,
  withAuth,
  proxyService.createProxy({
    target: config.authServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.ACCOUNT.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.ACCOUNT.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.USERS.PATH,
  withAuth,
  proxyService.createProxy({
    target: config.usersManagementServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.USERS.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.USERS.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.MEDICAL.PATH,
  withAuth,
  proxyService.createProxy({
    target: config.medicalServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.MEDICAL.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.MEDICAL.SERVICE_NAME,
  })
);

// strictLimiter — financial operations require tighter rate control
router.use(
  SERVICE_ROUTES.PAYMENT.PATH,
  strictLimiter,
  withAuth,
  proxyService.createProxy({
    target: config.paymentServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.PAYMENT.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.PAYMENT.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.APPOINTMENT.PATH,
  withAuth,
  proxyService.createProxy({
    target: config.appointmentServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.APPOINTMENT.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.APPOINTMENT.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.TRACKING.PATH,
  withAuth,
  proxyService.createProxy({
    target: config.trackingServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.TRACKING.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.TRACKING.SERVICE_NAME,
  })
);

router.use(
  SERVICE_ROUTES.COMMUNICATION.PATH,
  withAuth,
  proxyService.createProxy({
    target: config.communicationServiceUrl,
    pathRewrite: { [SERVICE_ROUTES.COMMUNICATION.REWRITE]: '' },
    serviceName: SERVICE_ROUTES.COMMUNICATION.SERVICE_NAME,
  })
);

export default router;
