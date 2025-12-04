import { Container } from "inversify";
import { TYPES } from "../types/index.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";
import { OTPservice } from "../services/otp.service.js";
import { DrAuthService } from "../services/dr.auth.service.js";
import { DrAuthRepository } from "../repositories/dr.auth.repository.js";
import { AdminAuthService } from "../services/admin.auth.service.js";
import { AdminAuthRepository } from "../repositories/admin.auth.repository.js";
import type { IAuthRepository } from "../repositories/interfaces/IAuthRepository.js";
import type { IAuthService } from "../services/interfaces/IAuthService.js";
import type { IOtpService } from "../services/interfaces/IOtpService.js";
import type { IDrAuthRepository } from "../repositories/interfaces/IDrAuthRepository.js";
import type { IDrAuthService } from "../services/interfaces/IDrAuthService.js";
import type { IAdminAuthService } from "../services/interfaces/IAdminAuthService.js";
import type { IAdminAuthRepository } from "../repositories/interfaces/IAdminRepository.js";

const container = new Container();

container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IOtpService>(TYPES.OTPService).to(OTPservice);
container.bind<IDrAuthRepository>(TYPES.DrAuthRepository).to(DrAuthRepository)
container.bind<IDrAuthService>(TYPES.DrAuthService).to(DrAuthService)
container.bind<IAdminAuthService>(TYPES.AdminAuthService).to(AdminAuthService)
container.bind<IAdminAuthRepository>(TYPES.AdminAuthRepository).to(AdminAuthRepository)

export default container;
