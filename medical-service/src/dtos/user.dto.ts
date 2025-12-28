import type { IProfile } from "../utils/interface.utils.js";

export type TUserProfUpdateRequestDTO = IProfile;

export type TUserProfileResponseDTO = IProfile & { currentWeek: number; dueDate: string };

export type TUserIdsDTO  = string[];
export type TUsersDetDTO = {
    userId:string
    fullName: string;
    age:number,
    week:number,
    trimester:string
    isFirstPregnancy:boolean
}


export type PregnancyInfo = {
  week: number;
  trimester: string;
  dueDate: string;
  progress: number;     // percentage
};

export type VitalRecord = {
  id: number;
  label: string;
  value: string;
  unit: string;
  status: string;
  color: string;
  date: string;
  desc: string;
};

export type LastPrescription = {
  doctor: string;
  date: string;
  medication: string;
};

export type LastReport = {
  name: string;
  date: string;
  status: string;
};

export type PatientDTO = {
  name: string;
  age: number;
  gender: string;
  id: string;
  status: string;
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;

  pregnancy: PregnancyInfo;

  vitals: VitalRecord[];

  abnormalities: string;

  lastPrescription: LastPrescription;

  lastReport: LastReport;
};
