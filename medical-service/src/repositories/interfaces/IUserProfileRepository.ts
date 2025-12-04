import type { IUserProfile } from "../../utils/interface.utils.js";

export interface IUserProfileRepository {
  create(data: IUserProfile): Promise<IUserProfile>;
  update(userId: string, data: Partial<IUserProfile>): Promise<IUserProfile | null>;
  findByUserId(userId: string): Promise<IUserProfile | null>;
}
