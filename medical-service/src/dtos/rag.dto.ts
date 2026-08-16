
export interface AskPregnancyQuestionDto {
  query: string;
  userId?: string;
}

export interface RagSourceDto {
  source: string;
  chunkIndex: number;
  score: number;
}

export interface AskPregnancyQuestionResponseDto {
  answer: string;
  sources: RagSourceDto[];
}

export interface IngestPregnancyPdfResultDto {
  source: string;
  chunksInserted: number;
}