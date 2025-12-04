import type { IDoctor } from "../../utils/interface.utils.js";

export interface IDrAuthRepository{
    create(doctorData:IDoctor):Promise<IDoctor>;
    findByEmail(email:string):Promise<IDoctor|null>;
    findById(id:string):Promise<IDoctor|null>
    update(id:string,doctor:Partial<IDoctor>):Promise<IDoctor | null>
    delete?(id:string):Promise<void>

}