import type { TDoctorProfileResponseDTO } from "../dtos/doctor.dto.js";
import type { IDoctorProfileDoc, IFetus, ISymptoms, IDoctorSlotDoc } from "./interface.utils.js";
import type { TfetusResponseDTO } from "../dtos/fetus.dto.js";
import type { TsymptomsReponseDTO } from "../dtos/symptoms.dto.js";
import type { TDoctorSlotResponseDTO } from "../dtos/doctor.slot.dto.js";


export class ResponseMapper {
    static doctorMapping(repoData:IDoctorProfileDoc):TDoctorProfileResponseDTO {
        return {
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

    static doctorSlotMapping(repoData: IDoctorSlotDoc): TDoctorSlotResponseDTO {
        return {
            id: repoData._id!,
            doctorId: repoData.doctorId,
            days: repoData.schedule,
            slotDuration: repoData.slotDuration,
            unavailableDates:repoData.unavailableDates,
            createdAt: repoData.createdAt?.toISOString() || '',
            updatedAt: repoData.updatedAt?.toISOString() || ''
        }
    }
}