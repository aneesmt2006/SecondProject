import type { ICreateRagChunkInput, IRagSearchResult } from "../../utils/interface.utils.js";

export interface IRagRepository { 
    deleteBySourceOrDocumentHash(source:string,documentHash:string):Promise<void>;
    insertMany(chunks:ICreateRagChunkInput[]):Promise<void>;
    vectorSearch(queryEmbedding:number[],limit:number,numCandidates:number):Promise<IRagSearchResult[]>
}