import { inject, injectable } from "inversify";
import type { ISymptomsService } from "./interfaces/ISymptomsService.js";
import { TYPES } from "../types/type.js";
import type { ISymptomsRepository } from "../repositories/interfaces/ISymptomsRepository.js";
import type { TsymptomsCreateDTO, TsymptomsReponseDTO } from "../dtos/symptoms.dto.js";
import { ADMIN_RESPONSE_MESSAGES } from "../constants/common-response.constants.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import type { ISymptoms } from "../utils/interface.utils.js";
import { extractSymptoms } from "../utils/htmlcode.extractor.utils.js";

@injectable()
export class SymptomsService implements ISymptomsService{
    constructor(@inject(TYPES.SymptomsRepository) private _symptomsRepo:ISymptomsRepository){}

    /**
     * Creates new symptom configuration for a week
     * @param symptomsData - Symptoms creation DTO
     * @returns Created symptoms data + success message
     */
    async create(symptomsData: TsymptomsCreateDTO): Promise<{ symptoms: TsymptomsReponseDTO; message: string; }> {


        let normalArr: string[];
        let normalHTML: string;

        if(Array.isArray(symptomsData.normalSymptoms)){
            normalArr = symptomsData.normalSymptoms;
            normalHTML = "";
        } else {
            normalArr = extractSymptoms(symptomsData.normalSymptoms);
            normalHTML = symptomsData.normalSymptoms;
        }

        let abnormalArr: string[];
        let abnormalHTML: string;

        if(Array.isArray(symptomsData.abnormalSymptoms)){
            abnormalArr = symptomsData.abnormalSymptoms;
            abnormalHTML = "";
        } else {
            abnormalArr = extractSymptoms(symptomsData.abnormalSymptoms);
            abnormalHTML = symptomsData.abnormalSymptoms;
        }


        const symptoms = await this._symptomsRepo.create({
            week: symptomsData.week,
            normalSymptomsHTML: normalHTML,
            abnormalSymptomsHTML: abnormalHTML,
            normalSymptoms: normalArr,
            abnormalSymptoms: abnormalArr, 
        });
        if(!symptoms) throw new Error(ADMIN_RESPONSE_MESSAGES.EMPTY_REPO);


        console.log("Service hit respone from repo---->",symptoms)
        const mappedSymtptoms = ResponseMapper.symptomsResponseMapping(symptoms)

        return {symptoms:mappedSymtptoms,message:ADMIN_RESPONSE_MESSAGES.CREATE}
    }

    /**
     * Updates symptom configuration for a week
     * @param symptomsData - Symptoms updata DTO
     * @returns Updated symptoms data + success message
     */
    async update(symptomsData: TsymptomsCreateDTO): Promise<{ symptoms: TsymptomsReponseDTO; message: string; }> {
        const symptoms = await this._symptomsRepo.findByWeek(symptomsData.week)
        if(!symptoms) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)
        
        
        let normalArr: string[];
        let normalHTML: string;

        if(Array.isArray(symptomsData.normalSymptoms)){
            normalArr = symptomsData.normalSymptoms;
            normalHTML = "";
        } else {
            normalArr = extractSymptoms(symptomsData.normalSymptoms);
            normalHTML = symptomsData.normalSymptoms;
        }

        let abnormalArr: string[];
        let abnormalHTML: string;

        if(Array.isArray(symptomsData.abnormalSymptoms)){
            abnormalArr = symptomsData.abnormalSymptoms;
            abnormalHTML = "";
        } else {
            abnormalArr = extractSymptoms(symptomsData.abnormalSymptoms);
            abnormalHTML = symptomsData.abnormalSymptoms;
        }

        const updatePayload: ISymptoms = {
            week: symptoms.week,
            normalSymptomsHTML: normalHTML,
            abnormalSymptomsHTML: abnormalHTML,
            normalSymptoms: normalArr,
            abnormalSymptoms: abnormalArr, 
        }

        const symptomsDoc = await this._symptomsRepo.update(symptoms._id!, updatePayload)
        
        const mappedSymptoms = ResponseMapper.symptomsResponseMapping(symptomsDoc!)
        return {symptoms: mappedSymptoms, message: ADMIN_RESPONSE_MESSAGES.UPDATE_SYMPTOMS}
    }

    /**
     * Retrieves all symptom configurations
     * @returns List of symptom data + success message
     */
    async findAll(): Promise<{ symptomsDatas: TsymptomsReponseDTO[]; message: string; }> {
        const allDoc = await this._symptomsRepo.find()
        if(!allDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.EMPTY_REPO)

        const mappedDoc = allDoc.map((symptoms: ISymptoms) => ResponseMapper.symptomsResponseMapping(symptoms))
        return {symptomsDatas: mappedDoc, message: ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }

    /**
     * Retrieves symptom configuration for a specific week
     * @param week - Week number
     * @returns Symptom data for the week + success message
     */
    async findWeekData(week: number): Promise<{ symptomsData: TsymptomsReponseDTO; message: string; }> {
        const weekDoc = await this._symptomsRepo.findByWeek(week)
        if(!weekDoc) throw new Error(ADMIN_RESPONSE_MESSAGES.WEEK_NOT_EXIST)

        const mappedWeek = ResponseMapper.symptomsResponseMapping(weekDoc);
        return {symptomsData: mappedWeek, message: ADMIN_RESPONSE_MESSAGES.FETCH_SUCCESS}
    }
}