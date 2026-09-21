import pdfParse from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const data = await pdfParse(buffer);
  return { text: data.text.trim(), pageCount: data.numpages };
}

// A text-layer PDF with almost no extractable characters relative to its
// page count is very likely a scanned image PDF — the caller should fall
// back to rendering pages and running OCR instead of trusting this text.
export function looksLikeScannedPdf(text: string, pageCount: number): boolean {
  const charsPerPage = text.length / Math.max(pageCount, 1);
  return charsPerPage < 20;
}
