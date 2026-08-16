export function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkTextByWords(
  text: string,
  maxWords: number,
  overlapWords: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  const step = maxWords - overlapWords;

  if (step <= 0) {
    throw new Error("overlapWords must be smaller than maxWords");
  }

  for (let start = 0; start < words.length; start += step) {
    const chunk = words.slice(start, start + maxWords).join(" ");

    if (chunk.split(/\s+/).length >= 80) {
      chunks.push(chunk);
    }
  }

  return chunks;
}