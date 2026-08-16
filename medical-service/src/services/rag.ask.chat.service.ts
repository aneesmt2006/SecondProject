import { inject, injectable } from "inversify";
import type { IRagAskChatService } from "./interfaces/IRagAskChatService.js";
import { TYPES } from "../types/type.js";
import type { IUserProfileRepository } from "../repositories/interfaces/IUserProfileRepository.js";
import type { AskPregnancyQuestionResponseDto } from "../dtos/rag.dto.js";
import { embedQuestion } from "../utils/embed.question.utils.js";
import type { IRagRepository } from "../repositories/interfaces/IRagRepository.js";
import { config } from "../config/env.config.js";
import { buildRagContext } from "../utils/pregnancy.context.utils.js";
import { ResponseMapper } from "../utils/response.mapper.utils.js";
import { generateAnswer } from "../utils/generate.gemini.ans.js";
import { buildPregnancyAnswerPrompt, buildPregnancySystemInstruction } from "../utils/prompt.utils.js";


@injectable()
export class RagAskChatService implements IRagAskChatService {
    constructor(@inject(TYPES.RagIngestionRepository)private _ragIngestionRepo:IRagRepository,@inject(TYPES.UserProfileRepository)private _userMedicalDataRepo:IUserProfileRepository){}

    async ask(query: string, userId: string): Promise<{message:string,answer:string}> {
        const queryEmbedding = await embedQuestion(query);
        const searchResults = await this._ragIngestionRepo.vectorSearch(queryEmbedding,config.vectorLimit,config.vectorNumCandidates)

        const relevantResults  =  searchResults.filter((item,index)=>item.score>=config.minScoreVector)

        if(relevantResults.length===0){
            return {answer:"I couldn't find enough reliable information in the preganncy knowledge base to answer that. Please contact your doctor or healthcare provider for guidance.",message:''}
        }

        const userProfile = await this._userMedicalDataRepo.findByUserId(userId);
        const medicalData = userProfile
            ? JSON.stringify(ResponseMapper.userMapping(userProfile), null, 2)
            : "No user medical profile completed yet.";

            console.log("MedicalData--->",medicalData)
        const pregnancyKnowledgeContext = buildRagContext(relevantResults);
        const system_instruction =  buildPregnancySystemInstruction();
        const prompt =  buildPregnancyAnswerPrompt({userMedicalProfile:medicalData,pregnancyKnowledgeContext:pregnancyKnowledgeContext,query})
        const answer = await generateAnswer({systemInstruction:system_instruction,prompt:prompt})

        const sources = relevantResults.map((item)=>({source:item.source,chunkIndex:item.chunkIndex,score:item.score}))
        return {message:'success',answer}
    }
}