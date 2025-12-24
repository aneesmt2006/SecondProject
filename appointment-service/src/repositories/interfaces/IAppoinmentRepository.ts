import type { AppointmentQuery, IAppointment } from "../../utils/interface.utils.js";


export interface IAppointentRepository {
    create(appoinment:IAppointment):Promise<IAppointment>
    update(id:string,status:string):Promise<IAppointment|null>
    find(doctorId:string,date:string):Promise<IAppointment[]>
    findById(id:string):Promise<IAppointment|null>
    updateAppointment(id:string, data:Partial<IAppointment>):Promise<IAppointment|null>
    getAllAppointmentsForDoctor(query:any):Promise<IAppointment[]>
    findByUserId(userId:string):Promise<IAppointment[]>

}