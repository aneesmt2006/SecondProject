import type { IUserSymptoms } from "../../utils/interface.utils.js";

export interface IUserSymptomsService {
    logSymptoms(data: { week: number, selectedNormalSymptoms: string[], selectedAbnormalSymptoms: string[], userId: string }): Promise<{ message: string, data: IUserSymptoms }>;
}
