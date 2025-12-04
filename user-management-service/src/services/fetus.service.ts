import { inject, injectable } from "inversify";
import type { TfetusCreateDTO, TfetusResponseDTO } from "../dtos/fetus.dto.js";
import type { IFetusService } from "./interfaces/IFetusService.js";
import type { IFetusRepository } from "../repositories/interfaces/IFetusRepository.js";
import { TYPES } from "../types/type.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { ADMIN_RESPONSE_MESSAGES } from "../constants/response-messages.constants.js";
import type { IFetus } from "../utils/interface.utils.js";

@injectable()
export class FetusService implements IFetusService{
    private _fetusRepo:IFetusRepository;
    
    constructor(@inject(TYPES.FetusRepository)fetusRepo:IFetusRepository){
        this._fetusRepo = fetusRepo
    }

    async create(fetusData: TfetusCreateDTO): Promise<{fetus:TfetusResponseDTO, message: string; }> {
        console.log("<------------------------>fetus service Hit",fetusData)
        const weekExist = await this._fetusRepo.findByweek(fetusData.week)
        console.log("IF week exist print week",weekExist)
        if(weekExist) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_EXIST)
        const fetusDoc = await this._fetusRepo.create(fetusData);
        if(!fetusDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.FAILED_CREATE_FETUS)
        const mappedFetus = ResponseMapper.fetusResponseMapping(fetusDoc);
        return {fetus:mappedFetus,message:ADMIN_RESPONSE_MESSAGES.CREATE}
    }

    async update(fetusData: TfetusCreateDTO): Promise<{fetus:TfetusResponseDTO, message: string; }> {
        const fetus = await this._fetusRepo.findByweek(fetusData.week!)
        if(!fetus)throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)
        console.log("Updating document",fetus)

        const updatePayload:IFetus = {
            week:fetus.week,
            fetusImage:fetusData.fetusImage,
            fruitImage:fetusData.fruitImage,
            height:fetusData.height,
            weight:fetusData.weight,
            development:fetusData.development
        }
        const fetusDoc = await this._fetusRepo.update(fetus._id!,updatePayload)

        console.log("Updated doc",fetusDoc)
        const mappedFetus = ResponseMapper.fetusResponseMapping(fetusDoc!)

        return {fetus:mappedFetus,message:ADMIN_RESPONSE_MESSAGES.UPDATE_FETUS}
    }

    async findAll(): Promise<{ fetusDatas: TfetusResponseDTO[]; message: string; }> {
        const allDoc = await this._fetusRepo.find()
        if(!allDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.EMPTY_REPO)

        const mappedDoc = allDoc.map((fetus:IFetus)=>ResponseMapper.fetusResponseMapping(fetus))
        return {fetusDatas:mappedDoc,message:ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }

    async findWeekData(week: number): Promise<{ fetusData: TfetusCreateDTO; message: string; }> {
        const weekDoc = await this._fetusRepo.findByweek(week)
        if(!weekDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)

        const mappedWeek = ResponseMapper.fetusResponseMapping(weekDoc);
        return {fetusData:mappedWeek,message:ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }
}