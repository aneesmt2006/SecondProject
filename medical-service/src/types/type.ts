import { AdminRepository } from "../repositories/admin.repository.js";

export const TYPES = {
    UserProfileService: Symbol.for("UserProfileService"),
    UserProfileRepository: Symbol.for("UserProfileRepository"),
    AdminService:Symbol.for("AdminService"),
    AdminRepository:Symbol.for("AdminRepository")
}