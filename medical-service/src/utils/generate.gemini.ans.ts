import { gemini, GEMINI_MODELS } from "../config/gemini.config.js";
import type { GenerateAnswerInput } from "./interface.utils.js";


export const generateAnswer=async(input:GenerateAnswerInput)=>{
    const response = await gemini.interactions.create({
        model:GEMINI_MODELS.chat!,
        input:input.prompt,
        system_instruction:input.systemInstruction,
        generation_config:{
            temperature:0.2
        }
    })

    return (response.output_text||'I could not generate an answer ,Please contact your healthcare provider')
}