import type { IUser, IDoctor } from "../../utils/interface.utils.js";

export interface ITokenRepository {
  findUserById(id: string): Promise<IUser | null>;
  findDoctorById(id: string): Promise<IDoctor | null>;
}
