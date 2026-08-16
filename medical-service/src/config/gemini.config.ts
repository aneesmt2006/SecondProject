import {GoogleGenAI} from '@google/genai'
import { config } from './env.config.js';


if (!config.geminiApiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

export const gemini = new GoogleGenAI({
    apiKey:config.geminiApiKey
})

export const GEMINI_MODELS  =  {
    embedding:config.geminiEmbeddingModel || 'gemini-embedding-2',
    chat:config.geminiChatModel
}

export const GEMINI_EMBEDDING_DIMENSIONS = Number(config.geminiEmbeddingDimension) || 768 
