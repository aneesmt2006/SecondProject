export interface IProfile {
  userId?:string,
  lmp?: string;
  isFirstPregnancy?: boolean;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  gestationalDiabetes?: boolean;
  gestationalSugar?: string;
  bloodPressure?: boolean;
  bpReading?: string;
  thyroidProblems?: boolean;
  pcosPcod?: boolean;
  takingSupplements?: string;
  knownAllergies?: string;
  familyRelated?: string;
  otherHealthIssues?: string;
}

export interface IUserProfile extends IProfile {
  userId: string;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

