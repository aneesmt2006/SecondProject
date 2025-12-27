import { Container } from "inversify";
import type { ISymptomsService } from "../services/interfaces/ISymptomsService.js";
import { TYPES } from "../types/type.js";
import { SymptomsService } from "../services/symptoms.service.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import { SymptomsRepository } from "../repositories/symptoms.repository.js";
import "../controllers/admin.symptoms.cotroller.js";
import "../controllers/user.symptoms.controller.js";
import type { IUserSymptomsService } from "../services/interfaces/IUserSymptomsService.js";
import { UserSymptomsService } from "../services/user.symptoms.service.js";
import type { IUserSymptomsRepository } from "../repositories/interfaces/IUserSymptomsRepository.js";
import { UserSymptomsRepository } from "../repositories/user.symptoms.repository.js";

const container = new Container();

container.bind<ISymptomsService>(TYPES.SymptomsService).to(SymptomsService)
container.bind<ISymptomsRepository>(TYPES.SymptomsRepository).to(SymptomsRepository)
container.bind<IUserSymptomsService>(TYPES.UserSymptomsService).to(UserSymptomsService);
container.bind<IUserSymptomsRepository>(TYPES.UserSymptomsRepository).to(UserSymptomsRepository);




export { container };
