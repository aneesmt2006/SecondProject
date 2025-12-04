import type {  TsymptomsCreateDTO, TsymptomsReponseDTO } from "../../dtos/symptoms.dto.js";
import type { ISymptoms } from "../../utils/interface.utils.js";

export  interface ISymptomsService {
    create(symptomsData:TsymptomsCreateDTO):Promise<{symptoms:TsymptomsReponseDTO,message:string}>,
    update(symptomsData:TsymptomsCreateDTO): Promise<{symptoms:TsymptomsReponseDTO, message: string; }>
    findAll():Promise<{symptomsDatas:TsymptomsReponseDTO[],message:string}>,
    findWeekData(week:number):Promise<{symptomsData:TsymptomsReponseDTO,message:string}>,
}