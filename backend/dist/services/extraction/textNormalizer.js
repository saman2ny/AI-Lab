import { extractDocxText } from "./docxParser.js";
import { extractPdfText, looksLikeScannedPdf } from "./pdfParser.js";
import { recognizeImage } from "./ocrProvider.js";
// Bridges PDF/DOCX/image upload -> raw text -> the AI extraction call. Each
// file contributes a labelled section so a multi-page photo upload (like a
// real 10-page lab report shot page by page) reads as one document instead
// of losing page boundaries.
export async function normalizeUpload(files) {
    const warnings = [];
    const sections = [];
    for (const [i, file] of files.entries()) {
        const label = files.length > 1 ? `--- Page ${i + 1}: ${file.originalname} ---` : `--- ${file.originalname} ---`;
        try {
            if (file.mimetype === "application/pdf") {
                const { text, pageCount } = await extractPdfText(file.buffer);
                if (looksLikeScannedPdf(text, pageCount)) {
                    warnings.push(`"${file.originalname}" looks like a scanned PDF with little embedded text; extraction may be incomplete.`);
                }
                sections.push(`${label}\n${text}`);
            }
            else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const text = await extractDocxText(file.buffer);
                sections.push(`${label}\n${text}`);
            }
            else if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
                const text = await recognizeImage(file.buffer);
                sections.push(`${label}\n${text}`);
            }
            else {
                warnings.push(`Skipped "${file.originalname}": unsupported file type.`);
            }
        }
        catch (err) {
            warnings.push(`Couldn't read "${file.originalname}": ${err instanceof Error ? err.message : "unknown error"}`);
        }
    }
    return { text: sections.join("\n\n"), warnings };
}
