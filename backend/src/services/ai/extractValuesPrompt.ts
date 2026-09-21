import { config } from "../../config.js";
import { aiEnabled, getClaudeClient } from "./claudeClient.js";
import { MOCK_RAW_VALUES, MOCK_REPORT_DATE, MOCK_REPORT_LABEL, type RawExtractedValue } from "./mockReportData.js";

export interface ExtractionResult {
  reportDate: string;
  reportLabel: string;
  values: RawExtractedValue[];
  extractionConfidence: "high" | "partial" | "low";
  unrecognizedText: string[];
}

const EXTRACT_TOOL = {
  name: "record_lab_values",
  description: "Record the structured lab values found in a lab report's raw text.",
  input_schema: {
    type: "object" as const,
    properties: {
      reportDate: { type: "string", description: "The report/collection date as printed, or best guess. Empty string if unknown." },
      reportLabel: { type: "string", description: "A short label for the panel, e.g. 'Complete Hemogram' or 'Blood panel'." },
      values: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            rawValue: { type: "string" },
            unit: { type: "string" },
            refRangeRaw: { type: "string", description: "The reference range exactly as printed, e.g. '12.0 - 15.5' or 'Below 100'." },
            category: { type: "string", description: "The section/category heading this value appeared under, e.g. 'Lipid Panel'." },
          },
          required: ["name", "rawValue", "unit", "refRangeRaw", "category"],
        },
      },
      extractionConfidence: { type: "string", enum: ["high", "partial", "low"] },
      unrecognizedText: {
        type: "array",
        items: { type: "string" },
        description: "Short notes on any table rows or sections that looked like lab values but couldn't be confidently parsed.",
      },
    },
    required: ["reportDate", "reportLabel", "values", "extractionConfidence", "unrecognizedText"],
  },
};

const SYSTEM_PROMPT = `You extract structured lab test results from raw OCR/parsed text of a medical lab report. Lab report layouts vary widely (tables, grouped sections, multi-page scans). Extract every distinct test result you can find with its value, unit, and reference range exactly as printed. Do not compute or infer anything — just transcribe. Do not include patient identifying information (name, ID, address) in the output, only test values. If the text contains no recognizable lab values at all, return an empty values array.`;

export async function extractLabValues(rawText: string): Promise<ExtractionResult> {
  if (!aiEnabled()) {
    return {
      reportDate: MOCK_REPORT_DATE,
      reportLabel: MOCK_REPORT_LABEL,
      values: MOCK_RAW_VALUES,
      extractionConfidence: "high",
      unrecognizedText: [],
    };
  }

  if (!rawText.trim()) {
    return { reportDate: "", reportLabel: "", values: [], extractionConfidence: "low", unrecognizedText: [] };
  }

  const client = getClaudeClient();
  const message = await client.messages.create({
    model: config.claudeModel,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawText.slice(0, 60_000) }],
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return { reportDate: "", reportLabel: "", values: [], extractionConfidence: "low", unrecognizedText: [] };
  }

  return toolUse.input as ExtractionResult;
}
