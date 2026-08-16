import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractTextFromPdf = async (
  filePath: string
): Promise<{ buffer: Buffer; text: string }> => {
  const buffer = fs.readFileSync(filePath);

  // Check if it has a valid PDF signature
  const isPdf = buffer.length >= 4 && buffer.toString("utf-8", 0, 4) === "%PDF";

  if (!isPdf) {
    const textContent = buffer.toString("utf-8");
    // Verify it looks like plain text and not random binary data
    const isText = !/[\x00-\x08\x0E-\x1F]/.test(textContent.slice(0, 1024));
    if (isText) {
      console.warn(`[Warning] File at ${filePath} is not a valid PDF (lacks %PDF signature). Falling back to plain text ingestion.`);
      return {
        buffer,
        text: textContent.trim(),
      };
    }
  }

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  }).promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const content = await page.getTextContent();

    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");

    text += pageText + "\n\n";
  }

  return {
    buffer,
    text: text.trim(),
  };
};