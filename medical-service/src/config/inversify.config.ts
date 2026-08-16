import { Container } from "inversify";
import { TYPES } from "../types/type.js";
import { UserProfileRepository } from "../repositories/user.profile.repository.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import { UserProfileService } from "../services/user.profile.service.js";
import type { IUserProfileService } from "../services/interfaces/IUserProfileService.js";
import { AdminService } from "../services/admin.service.js";
import "../controllers/user.profile.controller.js";
import  "../controllers/admin.controller.js";
import "../controllers/ask.question.controller.js"
import { AdminRepository } from "../repositories/admin.repository.js";
import { RagIngestionService } from "../services/rag.ingestion.service.js";
import { RagRepository } from "../repositories/rag.repository.js";
import { RagAskChatService } from "../services/rag.ask.chat.service.js";

const container = new Container();

container.bind<IUserProfileRepository>(TYPES.UserProfileRepository).to(UserProfileRepository);
container.bind<IUserProfileService>(TYPES.UserProfileService).to(UserProfileService);
container.bind(TYPES.AdminService).to(AdminService);
container.bind(TYPES.AdminRepository).to(AdminRepository);
container.bind(TYPES.RagIngestionService).to(RagIngestionService);
container.bind(TYPES.RagIngestionRepository).to(RagRepository);
container.bind(TYPES.RagAskChatService).to(RagAskChatService);


export { container };
