import type { ISymptoms } from "../utils/interface.utils.js";

export type TsymptomsCreateDTO = ISymptoms;
export type TsymptomsReponseDTO = {
  id: string;
  week: number;
  normalSymptoms: string;
  abnormalSymptoms: string;
  updatedAt: string;
  createdAt: string;
};
