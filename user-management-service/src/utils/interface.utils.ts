export interface IProfile {
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

export interface IDoctorProfile {
  experience?: string;
  address?: string;
  profileImageLink?: string;
  registration?: string;
  online_fee?: string;
  certificateLinks?: string[];
}

export interface IDoctorProfileDoc extends IDoctorProfile {
  doctorId: string;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFetus  {
  _id?:string,
  week: number;
  fetusImage: string;
  fruitImage: string;
  weight: string;
  height: string;
  development: string;
  createdAt?:string,
  updatedAt?:string,
}

export interface ISymptoms {
  _id?:string,
  week : number,
  normalSymptoms: string,
  abnormalSymptoms:string,
  createdAt?:string,
  updatedAt?:string,
}

export interface IBreak {
  start: string;
  end: string;
}

export interface IDaySchedule {
  enabled: boolean;
  start?: string;
  end?: string;
  breaks: IBreak[];
}

export interface  IDoctorSlot {
  doctorId: string;
  schedule: {
    Monday: IDaySchedule;
    Tuesday: IDaySchedule;
    Wednesday: IDaySchedule;
    Thursday: IDaySchedule;
    Friday: IDaySchedule;
    Saturday: IDaySchedule;
    Sunday: IDaySchedule;
  };
  slotDuration: string;
  unavailableDates:string[],

}

export interface IDoctorSlotDoc extends IDoctorSlot {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
