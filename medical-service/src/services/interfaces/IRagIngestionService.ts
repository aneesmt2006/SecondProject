import type { IngestPregnancyPdfResultDto } from "../../dtos/rag.dto.js";

export interface IRagIngestionService { 
    ingestPdf(filePath:string):Promise<IngestPregnancyPdfResultDto>;
    ingestFolder?(folderPath:string):Promise<IngestPregnancyPdfResultDto[]>; 
}