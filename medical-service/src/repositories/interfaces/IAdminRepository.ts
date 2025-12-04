import type { IUserProfile } from "../../utils/interface.utils.js";

export interface IAdminRepository {
    find():Promise<IUserProfile[]|null>
}