import { injectable } from "inversify";
import type { IRagRepository } from "./interfaces/IRagRepository.js";
import ragChunkModel from "../models/rag.chunk.model.js";
import type {
  ICreateRagChunkInput,
  IRagSearchResult,
} from "../utils/interface.utils.js";
import { config } from "../config/env.config.js";

@injectable()
export class RagRepository implements IRagRepository {
  async deleteBySourceOrDocumentHash(
    source: string,
    documentHash: string,
  ): Promise<void> {
    await ragChunkModel.deleteMany({ $or: [{ source }, { documentHash }] });
  }

  async insertMany(chunks: ICreateRagChunkInput[]): Promise<void> {
    await ragChunkModel.insertMany(chunks, { ordered: false });
  }

  async vectorSearch(
    queryEmbedding: number[],
    limit: number,
    numCandidates: number,
  ): Promise<IRagSearchResult[]> {
    return ragChunkModel.aggregate<IRagSearchResult>([
      {
        $vectorSearch: {
          index: config.ragVectorIndex,
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates,
          limit,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          source: 1,
          chunkIndex: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
  }
}
