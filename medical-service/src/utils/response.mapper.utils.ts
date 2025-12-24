// import type { TDoctorProfileResponseDTO } from "../dtos/doctor.dto.js";

import type { TUserProfileResponseDTO, TUserProfUpdateRequestDTO, TUsersDetDTO } from "../dtos/user.dto.js";
import type { IUserProfile } from "./interface.utils.js";


export class ResponseMapper {
    static userMapping(repoData:IUserProfile,currentWeek?:number, dueDate?:string):TUserProfileResponseDTO{
        return {
            userId:repoData.userId,
            fullName: repoData.fullName!,
            dateOfBirth: repoData.dateOfBirth!,
            lmp: repoData.lmp!,
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
            dueDate:dueDate || repoData.dueDate || '',
            bloodGroup:repoData.bloodGroup!,
            pcosPcod:repoData.pcosPcod!,

        }
    }

    static userPatientMapping(repoData:IUserProfile,week:number,age:number,trimester:string):TUsersDetDTO{
        return {
            userId:repoData.userId,
            fullName:repoData.fullName||"",
            week,
            age,
            trimester,
            isFirstPregnancy:repoData.isFirstPregnancy!

        }
    }
}