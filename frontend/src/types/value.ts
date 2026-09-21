export type Severity = "high" | "low" | "borderline" | "normal";

export interface LabValue {
  key: string;
  name: string;
  value: string;
  unit: string;
  status: Severity;
  ref: string;
  marker: number;
  bandA: number;
  bandB: number;
  plain: string;
  meaning: string;
  helps: string[];
  category?: string;
}

export interface ReportMeta {
  label: string;
  date: string;
}

export type ExtractionStatus = "idle" | "uploading" | "analysing" | "ready" | "empty" | "error";

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
}
