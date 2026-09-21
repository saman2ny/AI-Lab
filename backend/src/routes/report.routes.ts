import { Router, type Request, type Response } from "express";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import { normalizeUpload } from "../services/extraction/textNormalizer.js";
import { extractLabValues } from "../services/ai/extractValuesPrompt.js";
import { classifySeverity, parseRange } from "../services/ai/severityCalculator.js";
import { explainValues, type ValueForExplanation } from "../services/ai/explainValuesPrompt.js";
import { prioritizeWalkthroughValues } from "../services/ai/walkthroughPriority.js";
import { setReport, getReport, type StoredLabValue } from "../services/sessionStore/inMemoryStore.js";
import { generateReportPdf } from "../services/pdfExport/pdfGenerator.js";

export const reportRouter = Router();

function slugify(name: string, seen: Set<string>): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "value";
  let key = base;
  let i = 2;
  while (seen.has(key)) {
    key = `${base}${i++}`;
  }
  seen.add(key);
  return key;
}

reportRouter.post("/upload", requireAuth, upload.array("files", 12), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    return res.status(400).json({ status: "error", message: "No files were uploaded." });
  }

  // Express 4 doesn't forward a rejected promise from an async handler to
  // the error middleware on its own, so an unexpected failure anywhere in
  // this pipeline (a flaky AI call, a corrupt file that slips past the
  // per-file try/catch in normalizeUpload) is caught here and reported in
  // the same {status, message} shape the frontend already handles, instead
  // of hanging the Analysing screen forever.
  try {
    await handleUpload(req, res, files);
  } catch (err) {
    res.status(500).json({ status: "error", message: err instanceof Error ? err.message : "Something went wrong reading that report." });
  }
});

async function handleUpload(req: Request, res: Response, files: Express.Multer.File[]) {
  const { text, warnings } = await normalizeUpload(
    files.map((f) => ({ originalname: f.originalname, mimetype: f.mimetype, buffer: f.buffer }))
  );

  if (!text.trim() && warnings.length > 0) {
    return res.status(400).json({ status: "error", message: warnings[0] });
  }

  const extraction = await extractLabValues(text);

  if (extraction.values.length === 0) {
    return res.json({ status: "empty" });
  }

  const seenKeys = new Set<string>();
  const classified: StoredLabValue[] = extraction.values.map((raw) => {
    const key = slugify(raw.name, seenKeys);
    const numericValue = Number(raw.rawValue.replace(/[^\d.-]/g, ""));
    const severity = classifySeverity(numericValue, parseRange(raw.refRangeRaw));
    return {
      key,
      name: raw.name,
      value: raw.rawValue,
      unit: raw.unit,
      status: severity.status,
      ref: raw.refRangeRaw,
      marker: severity.marker,
      bandA: severity.bandA,
      bandB: severity.bandB,
      plain: "",
      meaning: "",
      helps: [],
      category: raw.category,
    };
  });

  const explanations = await explainValues(
    classified.map((v): ValueForExplanation => ({ key: v.key, name: v.name, value: v.value, unit: v.unit, status: v.status, ref: v.ref }))
  );
  for (const v of classified) {
    const e = explanations.get(v.key);
    if (e) {
      v.plain = e.plain;
      v.meaning = e.meaning;
      v.helps = e.helps;
    }
  }

  const walkthroughKeys = prioritizeWalkthroughValues(classified);

  const report = {
    meta: { label: extraction.reportLabel || "Lab report", date: extraction.reportDate || new Date().toLocaleDateString() },
    values: classified,
    walkthroughKeys,
  };
  setReport(req.auth!.sessionId, report);

  res.json({
    status: extraction.extractionConfidence === "low" ? "partial" : "ready",
    meta: report.meta,
    values: report.values,
    walkthroughKeys: report.walkthroughKeys,
    matchedCount: report.values.length,
  });
}

reportRouter.get("/pdf", requireAuth, async (req, res) => {
  const report = getReport(req.auth!.sessionId);
  if (!report) return res.status(404).json({ message: "No report in this session." });

  try {
    const pdf = await generateReportPdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${report.meta.label.replace(/\s+/g, "-")}.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : "Couldn't generate the PDF." });
  }
});
