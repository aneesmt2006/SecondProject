import type { IProfile } from "../utils/interface.utils.js";

export type TUserProfUpdateRequestDTO = IProfile;

export type TUserProfileResponseDTO = IProfile & { currentWeek: number; dueDate: string };

// Add other user fields if we decide to replicate/fetch them
// For now, focusing on profile data
