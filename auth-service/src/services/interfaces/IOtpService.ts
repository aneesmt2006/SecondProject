import type { IDoctor, IUser } from "../../utils/interface.utils.js";

export interface IOtpService {
  generateOTP(): string;
  storeOTP(email: string, otp: string): Promise<void>;
  getOTP(email: string): Promise<string | null>;
  deleteOTP(email: string): Promise<void>;
  sendOTP(email: string, otp: string): Promise<void>;
  storeTempUser(email: string, userData: Partial<IUser>): Promise<void>;
  getTempUser(email: string): Promise<IUser | null> ;
  deleteTempUser(email: string): Promise<void>;
  validateAndSendOtp(email: string, userData: Partial<IUser | IDoctor>): Promise<void>;
}
