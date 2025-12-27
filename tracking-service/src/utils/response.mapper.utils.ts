import type { ISymptoms } from "./interface.utils.js";
import type { TsymptomsReponseDTO } from "../dtos/symptoms.dto.js";




export class ResponseMapper {

    static symptomsResponseMapping(repoData:ISymptoms):TsymptomsReponseDTO{
        return {
            id:repoData._id!,
            week:repoData.week,
            normalSymptoms:repoData.normalSymptoms,
            abnormalSymptoms:repoData.abnormalSymptoms,
            updatedAt:repoData.updatedAt!,
            createdAt:repoData.createdAt!,
            
        }
    }

}