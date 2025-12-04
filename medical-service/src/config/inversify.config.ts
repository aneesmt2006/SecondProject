import { Container } from "inversify";
import { TYPES } from "../types/type.js";
import { UserProfileRepository } from "../repositories/user.profile.repository.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import { UserProfileService } from "../services/user.profile.service.js";
import type { IUserProfileService } from "../services/interfaces/IUserProfileService.js";
import { AdminService } from "../services/admin.service.js";
import "../controllers/user.profile.controller.js";
import  "../controllers/admin.controller.js";
import { AdminRepository } from "../repositories/admin.repository.js";

const container = new Container();

container.bind<IUserProfileRepository>(TYPES.UserProfileRepository).to(UserProfileRepository);
container.bind<IUserProfileService>(TYPES.UserProfileService).to(UserProfileService);
container.bind(TYPES.AdminService).to(AdminService);
container.bind(TYPES.AdminRepository).to(AdminRepository);


export { container };
