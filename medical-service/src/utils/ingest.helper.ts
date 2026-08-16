import { connectDB } from "../config/db.config.js";
import { container } from "../config/inversify.config.js"
import type { IRagIngestionService } from "../services/interfaces/IRagIngestionService.js";
import { TYPES } from "../types/type.js"

const script = async()=>{
    connectDB()
    const pdfPath = process.argv[2];
    const ragService = container.get<IRagIngestionService>(TYPES.RagIngestionService);
    if (!pdfPath) {
    throw new Error("Please provide a PDF path.");
  }
    const result = await ragService.ingestPdf(pdfPath)

    console.log(result)
}
script().catch(console.error)