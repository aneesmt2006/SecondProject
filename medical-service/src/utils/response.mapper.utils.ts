// import type { TDoctorProfileResponseDTO } from "../dtos/doctor.dto.js";

import type { TUserProfileResponseDTO, TUserProfUpdateRequestDTO } from "../dtos/user.dto.js";
import type { IUserProfile } from "./interface.utils.js";


export class ResponseMapper {
    static userMapping(repoData:IUserProfile,currentWeek?:number, dueDate?:string):TUserProfileResponseDTO{
        return {
            userId:repoData.userId,
            lmp:repoData.lmp!,
            bloodPressure:repoData.bloodPressure!,
            bpReading:repoData.bpReading!,
            familyRelated:repoData.familyRelated!,
            gestationalDiabetes:repoData.gestationalDiabetes!,
            gestationalSugar:repoData.gestationalSugar!,
            height:repoData.height!,
            isFirstPregnancy:repoData.isFirstPregnancy!,
            knownAllergies:repoData.knownAllergies!,
            otherHealthIssues:repoData.otherHealthIssues!,
            takingSupplements:repoData.takingSupplements!,
            thyroidProblems:repoData.thyroidProblems!,
            weight:repoData.weight!,
            currentWeek:currentWeek!,
            dueDate:dueDate!,
            bloodGroup:repoData.bloodGroup!,
            pcosPcod:repoData.pcosPcod!,

        }
    }
}