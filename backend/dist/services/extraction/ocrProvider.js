import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { config } from "../../config.js";
async function preprocess(buffer) {
    return sharp(buffer)
        .rotate() // auto-orient from EXIF
        .greyscale()
        .normalize()
        .resize({ width: 2000, withoutEnlargement: false })
        .toBuffer();
}
async function recognizeWithTesseract(buffer) {
    const processed = await preprocess(buffer);
    const worker = await createWorker("eng");
    try {
        const { data: { text }, } = await worker.recognize(processed);
        return text.trim();
    }
    finally {
        await worker.terminate();
    }
}
// Behind an interface so a cloud OCR provider (Google Vision, Textract) is a
// drop-in swap later via OCR_PROVIDER, without touching the extraction
// pipeline that calls this.
export async function recognizeImage(buffer) {
    switch (config.ocrProvider) {
        case "tesseract":
        default:
            return recognizeWithTesseract(buffer);
    }
}
