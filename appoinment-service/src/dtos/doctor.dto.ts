export type TDoctorSlotInfoDTO = {
    doctorId: string;
    slots: { time: string; status: string }[];
    slotDuration: string;
};
