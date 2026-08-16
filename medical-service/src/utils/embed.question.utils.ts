import { gemini, GEMINI_EMBEDDING_DIMENSIONS, GEMINI_MODELS } from "../config/gemini.config.js"

export const embedQuestion=async(query:string):Promise<number[]>=>{
    const response = await gemini.models.embedContent({
        model:GEMINI_MODELS.embedding,
        contents:`task:pregnancy question answering | query:${query}`,
        config:{
            outputDimensionality:GEMINI_EMBEDDING_DIMENSIONS
        }
    })
    const embedding = response.embeddings?.[0]?.values
    if(!embedding || embedding.length===0){
        throw new Error('Gemini did not return a questin embedding')
    }

    return embedding
}