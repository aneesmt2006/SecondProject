import { gemini, GEMINI_MODELS, GEMINI_EMBEDDING_DIMENSIONS } from "../config/gemini.config.js"

 export const  embedDocument=async(text: string, title: string): Promise<number[]> =>{
        const response = await gemini.models.embedContent({
            model:GEMINI_MODELS.embedding,
            contents:`title:${title||'none'} | text:${text}`,
            config:{
                outputDimensionality:GEMINI_EMBEDDING_DIMENSIONS
            }
        })

        const embedding = response.embeddings?.[0]?.values;
        if(!embedding || embedding.length === 0){
            throw new Error('gemini did not return a document embedding')
        }
        return embedding
    }