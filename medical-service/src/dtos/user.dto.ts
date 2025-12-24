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

// Add other user fields if we decide to replicate/fetch them
// For now, focusing on profile data
