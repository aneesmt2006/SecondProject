import type { IAppointment } from "../../utils/interface.utils.js";


export interface IAppointentRepository {
    create(appoinment:IAppointment):Promise<IAppointment>
    update(id:string,status:string):Promise<IAppointment|null>
    find(doctorId:string,date:string):Promise<IAppointment[]>
}