import type { IFetus } from "../../utils/interface.utils.js";

export interface IFetusRepository {
    create(fetusData:IFetus):Promise<IFetus>,
    findById(id:string):Promise<IFetus|null>,
    update(id:string,fetusData:IFetus):Promise<IFetus|null>,
    findByweek(week:number):Promise<IFetus|null>,
    find():Promise<IFetus[]|null>,
}