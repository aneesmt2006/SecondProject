    import type { IUser } from "../../utils/interface.utils.js";
    export interface IAuthRepository {
      create(user: IUser): Promise<IUser>;
      findById(id: string): Promise<IUser | null>;
      findByEmail(email: string): Promise<IUser | null>;
      update(id: string, user: Partial<IUser>): Promise<IUser | null>;
      delete?(id: string): Promise<void>;
    }

