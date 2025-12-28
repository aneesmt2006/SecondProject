export interface ISymptoms {
  _id?: string;
  week: number;
  normalSymptomsHTML: string;
  abnormalSymptomsHTML: string;
  normalSymptoms: string[];
  abnormalSymptoms: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserSymptoms {
  _id?: string;
  userId: string;
  week: number;
  selectedNormalSymptoms: string[];
  selectedAbnormalSymptoms: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserDet {
  userId: string;
  fullName: string;
  age: number;
  week: number;
  trimester: string;
  isFirstPregnancy?: boolean;
}
