import type { ISymptoms } from "../../utils/interface.utils.js";

export interface ISymptomsRepository {
    create(symptomsData:ISymptoms):Promise<ISymptoms|null>,
    findById(id:string):Promise<ISymptoms | null>,
    findByWeek(week:number):Promise<ISymptoms | null>,
    update(id:string,symptomsData:ISymptoms):Promise<ISymptoms|null>,
    find():Promise<ISymptoms[] | null>
}