import { Container } from "inversify";
import { TYPES } from "../types/type.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";
import { AppointmentService } from "../services/appointment.service.js";
import "../controllers/appointment.controller.js"; 
import "../controllers/doctor.slot.controller.js";
import "../controllers/appointment.slot.controller.js";
import "../controllers/appointment.chatting.controller.js";

import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import type { IAppointmentService } from "../services/interfaces/IAppointmentService.js";
import type { IDoctorSlotRepository } from "../repositories/interfaces/IDoctorSlotRepository.js";
import { DoctorSlotRepository } from "../repositories/doctor.slot.repository.js";
import type { IDoctorSlotService } from "../services/interfaces/IDoctorSlotService.js";
import { DoctorSlotService } from "../services/doctor.slot.service.js";
import type { IBookSlotsService } from "../services/interfaces/IBookSlotsService.js";
import { BookSlotsService } from "../services/book.slots.service.js";
import type { IBookedDoctorsService } from "../services/interfaces/IBookedDoctorsService.js";
import { BookedDoctorsService } from "../services/booked.doctors.service.js";
import { MedicalClient } from "../client/medical.client.js";

const container = new Container();

container.bind<IAppointentRepository>(TYPES.AppointmentRepository).to(AppointmentRepository);
container.bind<IAppointmentService>(TYPES.AppointmentService).to(AppointmentService);
container.bind<IDoctorSlotRepository>(TYPES.DoctorSlotRepository).to(DoctorSlotRepository);
container.bind<IDoctorSlotService>(TYPES.DoctorSlotService).to(DoctorSlotService);
container.bind<IBookSlotsService>(TYPES.BookSlotService).to(BookSlotsService);
container.bind<IBookedDoctorsService>(TYPES.BookedDoctorsService).to(BookedDoctorsService)

import { UserClient } from "../client/user.client.js";

container.bind(TYPES.MedicalClient).to(MedicalClient);
container.bind(TYPES.UserClient).to(UserClient);


export { container };
