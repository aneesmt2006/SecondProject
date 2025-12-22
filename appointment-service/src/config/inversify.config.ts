import { Container } from "inversify";
import { TYPES } from "../types/type.js";
import { AppoinmentRepository } from "../repositories/appoinment.service.js";
import { AppoinmentService } from "../services/appoinment.service.js";
import "../controllers/appoinment.controller.js"; 
import "../controllers/doctor.slot.controller.js";
import "../controllers/appoinment.slot.controller.js";

import type { IAppointentRepository } from "../repositories/interfaces/IAppoinmentRepository.js";
import type { IAppoinmentService } from "../services/interfaces/IAppoinmentService.js";
import type { IDoctorSlotRepository } from "../repositories/interfaces/IDoctorSlotRepository.js";
import { DoctorSlotRepository } from "../repositories/doctor.slot.repository.js";
import type { IDoctorSlotService } from "../services/interfaces/IDoctorSlotService.js";
import { DoctorSlotService } from "../services/doctor.slot.service.js";
import type { IBookSlotsService } from "../services/interfaces/IBookSlotsService.js";
import { BookSlotsService } from "../services/book.slots.service.js";

const container = new Container();

container.bind<IAppointentRepository>(TYPES.AppoinmentRepository).to(AppoinmentRepository);
container.bind<IAppoinmentService>(TYPES.AppoinmentService).to(AppoinmentService);
container.bind<IDoctorSlotRepository>(TYPES.DoctorSlotRepository).to(DoctorSlotRepository);
container.bind<IDoctorSlotService>(TYPES.DoctorSlotService).to(DoctorSlotService);
container.bind<IBookSlotsService>(TYPES.BookSlotService).to(BookSlotsService);

export { container };
