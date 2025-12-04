import type { IDoctorProfileDoc } from "../../utils/interface.utils.js";

export interface IDoctorProfileRepository {
  create(data: IDoctorProfileDoc): Promise<IDoctorProfileDoc>;
  update(doctorId: string, data: Partial<IDoctorProfileDoc>): Promise<IDoctorProfileDoc | null>;
  findByDoctorId(doctorId: string): Promise<IDoctorProfileDoc | null>;
  findAll(): Promise<IDoctorProfileDoc[]>;
}
