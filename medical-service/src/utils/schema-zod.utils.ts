import {z} from 'zod'
export const pregnantProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  lmp: z.string().min(1, "LMP date is required"),
  isFirstPregnancy: z.boolean({
    message: "isFirstPregnancy must be true or false",
  }),

  bloodGroup: z.string(),

  height: z.string().min(1, "Height is required"),

  weight: z.string().min(1, "Weight is required"),

  gestationalDiabetes: z.boolean(),
  gestationalSugar: z.string(),

  bloodPressure: z.boolean(),
  bpReading: z.string(),

  thyroidProblems: z.boolean(),
  pcosPcod: z.boolean(),

  takingSupplements: z.string().min(1, "Required"),
  knownAllergies: z.string().min(1, "Required"),
  familyRelated: z.string().min(1, "Required"),

  otherHealthIssues: z.string().optional(),
});
