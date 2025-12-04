import type { IDaySchedule } from "../utils/interface.utils.js";

export type TDoctorSlotCreateDTO = {
  doctorId: string;
  days: {
    Monday: IDaySchedule;
    Tuesday: IDaySchedule;
    Wednesday: IDaySchedule;
    Thursday: IDaySchedule;
    Friday: IDaySchedule;
    Saturday: IDaySchedule;
    Sunday: IDaySchedule;
  };
  slotDuration: string;
};

export type TDoctorSlotResponseDTO = {
  id: string;
  doctorId: string;
  days: {
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
  createdAt: string;
  updatedAt: string;
};
