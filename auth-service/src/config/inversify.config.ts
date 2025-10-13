import { Container } from "inversify";
import { TYPES } from '../types/index.js'
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";
// import { AuthController } from "../controllers/auth.controller.js";


const container = new Container()

container.bind(TYPES.AuthRepository).to(AuthRepository)
container.bind(TYPES.AuthService).to(AuthService)
// container.bind(TYPES.AuthController).to(AuthController)

export default container

