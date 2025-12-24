import type { TDoctorApmntDetDTO, TDoctorProfileResponseDTO } from "../dtos/doctor.dto.js";
import type { IDoctorProfileDoc, IFetus, ISymptoms } from "./interface.utils.js";
import type { TfetusResponseDTO } from "../dtos/fetus.dto.js";
import type { TsymptomsReponseDTO } from "../dtos/symptoms.dto.js";




export class ResponseMapper {
    static doctorMapping(repoData:IDoctorProfileDoc):TDoctorProfileResponseDTO {
        return {
            fullName: repoData.fullName!,
            clinicName: repoData.clinicName!,
            specialization:repoData.specialization!,
            address:repoData.address!,
            experience:repoData.experience!,
            registration:repoData.registration!,
            profileImageLink:repoData.profileImageLink!,
            certificateLinks:repoData.certificateLinks!,
            online_fee:repoData.online_fee!,
            doctorId: repoData.doctorId
        }
    }

    static fetusResponseMapping(repoData:IFetus):TfetusResponseDTO{
        return {
            id:repoData._id!,
            week:repoData.week,
            fetusImage:repoData.fetusImage,
            fruitImage:repoData.fruitImage,
            weight:repoData.weight,
            height:repoData.height,
            development:repoData.development,
            createdAt:repoData.createdAt||'',
            updatedAt:repoData.updatedAt||'',
        }
    }

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




    static doctorApmntDetMapping(repoData:IDoctorProfileDoc):TDoctorApmntDetDTO {
        return {
            doctorId:repoData.doctorId!,
            fullName: repoData.fullName!,
            experience:repoData.experience!,
            online_fee:repoData.online_fee!,
            profileImageLink:repoData.profileImageLink!,
        }
    }
}