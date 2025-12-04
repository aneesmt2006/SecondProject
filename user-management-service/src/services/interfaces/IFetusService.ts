import type{ TfetusCreateDTO, TfetusResponseDTO } from "../../dtos/fetus.dto.js"

export interface IFetusService { 
    create(fetusData:TfetusCreateDTO):Promise<{fetus:TfetusResponseDTO,message:string}>
    update(fetusData:TfetusCreateDTO): Promise<{fetus:TfetusResponseDTO, message: string; }>
    findAll():Promise<{fetusDatas:TfetusResponseDTO[],message:string}>,
    findWeekData(week:number):Promise<{fetusData:TfetusCreateDTO,message:string}>,
    
}