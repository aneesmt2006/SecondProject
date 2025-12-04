import { inject, injectable } from "inversify";
import type { ISymptomsService } from "./interfaces/ISymptomsService.js";
import { TYPES } from "../types/type.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import type { TsymptomsCreateDTO, TsymptomsReponseDTO } from "../dtos/symptoms.dto.js";
import { ADMIN_RESPONSE_MESSAGES } from "../constants/response-messages.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import type { ISymptoms } from "../utils/interface.utils.js";

@injectable()
export class SymptomsService implements ISymptomsService{
    constructor(@inject(TYPES.SymptomsRepository) private _symptomsRepo:ISymptomsRepository){}

    async create(symptomsData: TsymptomsCreateDTO): Promise<{ symptoms: TsymptomsReponseDTO; message: string; }> {
        const symptoms = await this._symptomsRepo.create(symptomsData);
        if(!symptoms) throw new Error(ADMIN_RESPONSE_MESSAGES.EMPTY_REPO);

        const mappedSymtptoms = ResponseMapper.symptomsResponseMapping(symptoms)

        return {symptoms:mappedSymtptoms,message:ADMIN_RESPONSE_MESSAGES.CREATE}
    }

    async update(symptomsData: TsymptomsCreateDTO): Promise<{ symptoms: TsymptomsReponseDTO; message: string; }> {
        const symptoms = await this._symptomsRepo.findByWeek(symptomsData.week)
        if(!symptoms) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)
        
        const updatePayload: ISymptoms = {
            week: symptoms.week,
            normalSymptoms: symptomsData.normalSymptoms,
            abnormalSymptoms: symptomsData.abnormalSymptoms
        }

        const symptomsDoc = await this._symptomsRepo.update(symptoms._id!, updatePayload)
        
        const mappedSymptoms = ResponseMapper.symptomsResponseMapping(symptomsDoc!)
        return {symptoms: mappedSymptoms, message: ADMIN_RESPONSE_MESSAGES.UPDATE_SYMPTOMS}
    }

    async findAll(): Promise<{ symptomsDatas: TsymptomsReponseDTO[]; message: string; }> {
        const allDoc = await this._symptomsRepo.find()
        if(!allDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.EMPTY_REPO)

        const mappedDoc = allDoc.map((symptoms: ISymptoms) => ResponseMapper.symptomsResponseMapping(symptoms))
        return {symptomsDatas: mappedDoc, message: ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }

    async findWeekData(week: number): Promise<{ symptomsData: TsymptomsReponseDTO; message: string; }> {
        const weekDoc = await this._symptomsRepo.findByWeek(week)
        if(!weekDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)

        const mappedWeek = ResponseMapper.symptomsResponseMapping(weekDoc);
        return {symptomsData: mappedWeek, message: ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }
}