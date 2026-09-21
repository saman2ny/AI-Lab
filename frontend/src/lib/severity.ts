import type { Severity } from "../types/value";

export const SEVERITY_COLOR: Record<Severity, string> = {
  high: "var(--sev-flag)",
  low: "var(--sev-flag)",
  borderline: "var(--sev-borderline)",
  normal: "var(--sev-normal)",
};

export const SEVERITY_TINT: Record<Severity, string> = {
  high: "var(--sev-flag-tint)",
  low: "var(--sev-flag-tint)",
  borderline: "var(--sev-borderline-tint)",
  normal: "var(--sev-normal-tint)",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Above range",
  low: "Below range",
  borderline: "Borderline",
  normal: "In range",
};

// Shape encoding is required, not decorative — it is how the colour-blindness
// requirement is met. Never rely on hue alone. Always ships alongside colour + text.
export type SeverityShape = "diamond" | "square" | "circle";

export const SEVERITY_SHAPE: Record<Severity, SeverityShape> = {
  high: "diamond",
  low: "diamond",
  borderline: "square",
  normal: "circle",
};

export function isFlagged(status: Severity): boolean {
  return status === "high" || status === "low";
}
