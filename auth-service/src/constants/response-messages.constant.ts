export const AUTH_RESPONSE_MESSAGES = {
  OTP_SEND_SUCCESS:"OTP sent successfully",
  RESEND_OTP_SUCCESS:"New OTP sent successfully",
  LOGIN_SUCCESS:"Login successfull",
  REGISTER_SUCCESS:"User created and verification email sent Success",
  ADMIN_LOGIN_SUCCESS:"Admin login successfull",

  GOOGLE_REGISTER_SUCCESS: "User registered successfully with Google",
  GOOGLE_LOGIN_SUCCESS: "Google login successful",

  EMAIL_REQUIRED:"Email is required",
  PASSWORD_REQUIRED:"Passoword is required",
  PASSWORD_CHANGED:"Password changed succesfully",
  FORGOT_PASSWORD_EMAIL_REQUIRED:"Email is required",
  FORGOT_PASSWORD_SUCCESS:"Password reset link sent",
  RESET_PASSWORD_REQUIRED:"Password and token is required",
  RESET_PASSWORD_SUCCESS:"Password changed successfully",

  VERIFY_ACCOUNT_REQUIRED:"Password and token is required",
  VERIFY_ACCOUNT_SUUCESS:"Account verification successfull",

  REFRESH_TOKEN_MISSING:"Refresh token is missing",
  REFRESH_TOKEN_SUCCCESS:"New Refresh Token & access Token sent successfully",
  LOGOUT_SUCCESS:"Logged out successfully",

  PROFILE_SUCCESS:"Profile Updated Successfully",

  FILE_UPLOAD:"File uplaod Successfully",
  GET_DOCTOR:"Doctor data fetched successfully"
} as const


export const USER_RESPONSE_MESSAGES = {
    NOT_FOUND:"User not found",
    UNAUTHORIZED:"Unauthorized access",
    UPDATED:"User updated successfully",
    STATUS_UPDATED:"User status updated successfully",
    INVALID_ID:"Invalid user/doctor ID",
    INVALID_UPDATED_DATA:"Invalid updated Data",
    INTERNAL_ERROR:"Intenal server error",
    GET_USER:"User data fetched successfully",
    
} as const


export const ADMIN_RESPONSE_MESSAGES = {
  FETCHED_SUCCESS:"Users data fetched successfully",
  NOT_ACCESS_TO_ADMIN_ROUTE: "Forbidden: Access Denied to ADMIN",
  STATUS_UPDATED: "status updated successfully",
  DB_CHANGE_FAILED:"DB change failed"
}
