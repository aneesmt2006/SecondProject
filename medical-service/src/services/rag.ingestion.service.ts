import { inject, injectable } from "inversify";
import type { IRagIngestionService } from "./interfaces/IRagIngestionService.js";
import { TYPES } from "../types/type.js";
import type { IRagRepository } from "../repositories/interfaces/IRagRepository.js";
import type { IngestPregnancyPdfResultDto } from "../dtos/rag.dto.js";
import path from "path";
import { extractTextFromPdf } from "../utils/pdf.reader.utils.js";
import { create256Hash } from "../utils/file.hash.utils.js";
import { chunkTextByWords, normalizeText } from "../utils/text.chunk.utils.js";
import { config } from "../config/env.config.js";
import { embedDocument } from "../utils/embed.doc.js";
import type { ICreateRagChunkInput } from "../utils/interface.utils.js";


@injectable()
export class RagIngestionService implements IRagIngestionService {
    constructor(@inject(TYPES.RagIngestionRepository)private _ragRepo:IRagRepository){}

    
    async ingestPdf(filePath: string): Promise<IngestPregnancyPdfResultDto> {
        const absolutePath = path.resolve(filePath)
        const source = path.basename(absolutePath)

        const  { buffer,text} = await extractTextFromPdf(absolutePath)
        const documentHash = create256Hash(buffer)
        const cleanedText= normalizeText(text)
        if(!cleanedText){
            throw new Error(`No readable text found in PDF :${source}`)
        }

        const chunks = chunkTextByWords(text,config.ragMaxWords,config.ragOverlapWords)

        if(!chunks.length){
            throw new Error(`No usable chunks created from PDF :${source}`)
        }

        await this._ragRepo.deleteBySourceOrDocumentHash(source,documentHash);
        const documents:ICreateRagChunkInput[] = [];

        for(let index=0;index<chunks.length;index++){
            const chunk = chunks[index]!;
            const embedding  = await embedDocument(chunk,source)

            documents.push({
                text:chunk,
                embedding,
                source,
                chunkIndex:index,
                documentHash
            })

            console.log(`Embedded ${source} chunk ${index+1}/${chunks.length}`)
        }
        await this._ragRepo.insertMany(documents)
        return {source,chunksInserted:documents.length}
    }   
}