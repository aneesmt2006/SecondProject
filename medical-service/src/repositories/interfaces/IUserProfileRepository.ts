import type {
  IUserProfile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mainData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onlyData,
} from "../../utils/interface.utils.js";

export interface IUserProfileRepository {
  create(data: IUserProfile): Promise<IUserProfile>;
  update(
    userId: string,
    data: Partial<IUserProfile>,
  ): Promise<IUserProfile | null>;
  findByUserId(userId: string): Promise<IUserProfile | null>;
  findByIds(userIds: string[]): Promise<IUserProfile[] | null>;
}
