import dotenv from 'dotenv'
dotenv.config()

export const config = {
 mongoUrl:process.env.MONGO_URL,
 port:process.env.PORT,
 authServiceUrl:process.env.AUTH_SERVICE_URL,
 geminiApiKey:process.env.GEMINI_API_KEY,
 ragCollection:process.env.RAG_COLLECTION||'pregnancy_rag_chunks',
 ragVectorIndex:process.env.RAG_VECTOR_INDEX || 'pregnancy_vector_index',
 ragMaxWords:100,
 ragOverlapWords:20,
 minScoreVector:Number(process.env.VECTOR_MIN_SCORE),
 vectorLimit:Number(process.env.VECTOR_LIMIT)||5,
 vectorNumCandidates:Number(process.env.VECTOR_NUM_CANDIDATES)||75, 
 geminiEmbeddingModel:process.env.GEMINI_EMBEDDING_MODEL,
 geminiChatModel:process.env.GEMINI_CHAT_MODEL,
 geminiEmbeddingDimension:process.env.GEMINI_EMBEDDING_DIMENSIONS,
 
}

console.log("Environment Config Loaded (Medical Service):", {
    mongoUrlPresent: !!config.mongoUrl,
    mongoUrlStart: config.mongoUrl ? config.mongoUrl.substring(0, 15) + '...' : 'undefined'
});
