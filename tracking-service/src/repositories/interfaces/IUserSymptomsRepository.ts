import type { IUserSymptoms } from "../../utils/interface.utils.js";

export interface IUserSymptomsRepository {
    create(data: IUserSymptoms): Promise<IUserSymptoms | null>;
    findByUserAndWeek(userId: string, week: number): Promise<IUserSymptoms | null>;
    update(id: string, data: Partial<IUserSymptoms>): Promise<IUserSymptoms | null>;
}
