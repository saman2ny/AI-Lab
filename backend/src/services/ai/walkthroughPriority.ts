import type { StoredLabValue } from "../sessionStore/inMemoryStore.js";

const ORDER: Record<StoredLabValue["status"], number> = {
  high: 0,
  low: 0,
  borderline: 1,
  normal: 2,
};

// Out-of-range values first, then borderline, top 4 — matches the design's
// documented walkthrough order (never left to the model).
export function prioritizeWalkthroughValues(values: StoredLabValue[]): string[] {
  return [...values]
    .filter((v) => v.status !== "normal")
    .sort((a, b) => ORDER[a.status] - ORDER[b.status])
    .slice(0, 4)
    .map((v) => v.key);
}
