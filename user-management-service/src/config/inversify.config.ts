import { Container } from "inversify";
import { TYPES } from "../types/type.js";
import { DoctorProfileRepository } from "../repositories/doctor.profile.repository.js";
import type { IDoctorProfileRepository } from "../repositories/interfaces/IDoctorProfileRepository.js";
import { DoctorProfileService } from "../services/doctor.profile.service.js";
import type { IDoctorProfileService } from "../services/interfaces/IDoctorProfileService.js";
import { FetusRepository } from "../repositories/fetus.repository.js";
import type { IFetusRepository } from "../repositories/interfaces/IFetusRepository.js";
import { FetusService } from "../services/fetus.service.js";
import type { IFetusService } from "../services/interfaces/IFetusService.js";
import type { ISymptomsService } from "../services/interfaces/ISymptomsService.js";
import { SymptomsService } from "../services/symptoms.service.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import { SymptomsRepository } from "../repositories/symptoms.repository.js";
import "../controllers/doctor.profile.controller.js";
import "../controllers/upload.controller.js";
import "../controllers/admin.fetus.controller.js";
import "../controllers/admin.upload.controller.js";
import "../controllers/admin.symptoms.cotroller.js";


const container = new Container();

container.bind<IDoctorProfileRepository>(TYPES.DoctorProfileRepository).to(DoctorProfileRepository);
container.bind<IDoctorProfileService>(TYPES.DoctorProfileService).to(DoctorProfileService);
container.bind<IFetusRepository>(TYPES.FetusRepository).to(FetusRepository);
container.bind<IFetusService>(TYPES.FetusService).to(FetusService);
container.bind<ISymptomsService>(TYPES.SymptomsService).to(SymptomsService)
container.bind<ISymptomsRepository>(TYPES.SymptomsRepository).to(SymptomsRepository)

export { container };
