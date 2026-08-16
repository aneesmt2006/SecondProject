import type { Document } from "mongoose";

export interface IProfile {
  userId?: string;
  fullName?: string;
  dateOfBirth?: string;
  lmp?: string;
  dueDate?: string;
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
  primaryDoctor?: string;
}

export interface IUserProfile extends IProfile {
  userId: string;
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRagChunk extends Document {
  text: string;
  embedding: number[];
  source: string;
  chunkIndex: number;
  documentHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateRagChunkInput {
  text: string;
  embedding: number[];
  source: string;
  chunkIndex: number;
  documentHash: string;
}

export interface IRagSearchResult {
  text: string;
  source: string;
  chunkIndex: number;
  score: number;
}

export interface GenerateAnswerInput { 
  systemInstruction:string,
  prompt:string,
}
export type TDoctor = {
  fullName: string;
  clinicName: string;
  doctorId: string;
};
