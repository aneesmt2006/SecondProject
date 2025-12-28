export const SERVICE_ROUTES = {
  ACCOUNT: {
    PATH: "/account",
    REWRITE: "^/api/v1/account",
    SERVICE_NAME: "auth-service"
  },
  USERS: {
    PATH: "/users",
    REWRITE: "/api/v1/users",
    SERVICE_NAME: "users-management-service"
  },
  MEDICAL: {
    PATH: "/medical",
    REWRITE: "/api/v1/medical",
    SERVICE_NAME: "medical-service"
  },
  PAYMENT: {
    PATH: "/payment",
    REWRITE: "/api/v1/payment",
    SERVICE_NAME: "payment-service"
  },
  APPOINTMENT: {
    PATH: "/appoinment",
    REWRITE: "/api/v1/appoinment",
    SERVICE_NAME: "appoinment-service"
  },
  TRACKING: {
    PATH: "/tracking",
    REWRITE: "/api/v1/tracking",
    SERVICE_NAME: "tracking-service"
  }
};
