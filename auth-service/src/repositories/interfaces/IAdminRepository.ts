import type { IDoctor, IUser } from "../../utils/interface.utils.js";

export interface IAdminAuthRepository{
    findByEmail(email:string):Promise<IUser | null>
    findUsers():Promise<IUser[]|null>
    findDoctors():Promise<IDoctor[]|null>
    updateDoctorStatus(id:string,status:string):Promise<IDoctor | null>
    updateUserStatus(id:string,status:boolean):Promise<IUser | null>

}