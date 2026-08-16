import mongoose, { Document, Schema } from "mongoose";
import type { IRagChunk } from "../utils/interface.utils.js";
import { config } from "../config/env.config.js";

const PregnancyRagChunkSchema = new Schema<IRagChunk>(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    source: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    documentHash: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: config.ragCollection||'pregnancy_rag_chunks',
  },
);

export default mongoose.model<IRagChunk>('PregnancyRagChunk',PregnancyRagChunkSchema)