export const AUTH_RESPONSE_MESSAGES = {
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
  LOGOUT_SUCCESS:"Logged out successfully"
} as const


export const USER_RESPONSE_MESSAGES = {
    NOT_FOUND:"User not found",
    UNAUTHORIZED:"Unauthorized access",
    UPDATED:"User updated successfully",
    STATUS_UPDATED:"User status updated successfully",
    INVALID_ID:"Invalid user ID",
    INVALID_UPDATED_DATA:"Invalid updated Data",
    INTERNAL_ERROR:"Intenal server error"
} as const
