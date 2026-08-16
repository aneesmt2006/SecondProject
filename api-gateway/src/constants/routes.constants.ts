// PATH     — Express router prefix (relative to /api/v1)
// REWRITE  — regex for http-proxy-middleware pathRewrite (^ anchored)
// SERVICE_NAME — label used in logs and error responses
export const SERVICE_ROUTES = {
  ACCOUNT: {
    PATH: '/account',
    REWRITE: '^/api/v1/account',
    SERVICE_NAME: 'auth-service',
  },
  USERS: {
    PATH: '/users',
    REWRITE: '^/api/v1/users',
    SERVICE_NAME: 'users-management-service',
  },
  MEDICAL: {
    PATH: '/medical',
    REWRITE: '^/api/v1/medical',
    SERVICE_NAME: 'medical-service',
  },
  PAYMENT: {
    PATH: '/payment',
    REWRITE: '^/api/v1/payment',
    SERVICE_NAME: 'payment-service',
  },
  APPOINTMENT: {
    PATH: '/appointment',
    REWRITE: '^/api/v1/appointment',
    SERVICE_NAME: 'appointment-service',
  },
  TRACKING: {
    PATH: '/tracking',
    REWRITE: '^/api/v1/tracking',
    SERVICE_NAME: 'tracking-service',
  },
  COMMUNICATION: {
    PATH: '/communication',
    REWRITE: '^/api/v1/communication',
    SERVICE_NAME: 'communication-service',
  },
  NOTIFICATION: {
    PATH: '/notification',
    REWRITE: '^/api/v1/notification',
    SERVICE_NAME: 'notification-service',
  },
} as const;
