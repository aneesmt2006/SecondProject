import type { AskPregnancyQuestionResponseDto } from "../../dtos/rag.dto.js";

export interface IRagAskChatService {
    ask(query:string,userId:string):Promise<{answer:string,message:string}>
}