export type Severity = "high" | "low" | "borderline" | "normal";

export interface ParsedRange {
  lo?: number;
  hi?: number;
}

// Handles the reference-range formats real lab reports actually use:
// "12.0 – 15.5", "12.0-15.5", "40-70", "Below 100", "Above 40", "<1.0",
// ">40", "< 1.0". Anything else falls back to {lo: undefined, hi: undefined}
// (treated as "can't classify" by the caller).
export function parseRange(raw: string): ParsedRange {
  const s = raw.trim();

  const below = s.match(/^(below|less than|<)\s*([\d.]+)/i);
  if (below) return { hi: Number(below[2]) };

  const above = s.match(/^(above|greater than|more than|>)\s*([\d.]+)/i);
  if (above) return { lo: Number(above[2]) };

  const between = s.match(/([\d.]+)\s*(?:-|–|—|to)\s*([\d.]+)/i);
  if (between) {
    const lo = Number(between[1]);
    const hi = Number(between[2]);
    return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
  }

  return {};
}

export interface SeverityResult {
  status: Severity;
  marker: number;
  bandA: number;
  bandB: number;
}

const BOUNDED_MARGIN_PCT = 0.15;
const OPEN_MARGIN_PCT = 0.1;
const WINDOW_PADDING_PCT = 0.35;

function clampPct(n: number): number {
  return Math.min(97, Math.max(3, n));
}

export function classifySeverity(value: number, range: ParsedRange): SeverityResult {
  const { lo, hi } = range;

  if (lo !== undefined && hi !== undefined) {
    const width = hi - lo;
    const margin = width * BOUNDED_MARGIN_PCT;
    const windowLo = lo - width * WINDOW_PADDING_PCT;
    const windowHi = hi + width * WINDOW_PADDING_PCT;
    const span = windowHi - windowLo;
    const toPct = (v: number) => ((v - windowLo) / span) * 100;

    let status: Severity;
    if (value < lo - margin) status = "low";
    else if (value < lo) status = "borderline";
    else if (value > hi + margin) status = "high";
    else if (value > hi) status = "borderline";
    else if (value < lo + margin || value > hi - margin) status = "borderline";
    else status = "normal";

    return {
      status,
      marker: clampPct(toPct(value)),
      bandA: clampPct(toPct(lo)),
      bandB: clampPct(toPct(hi)),
    };
  }

  if (hi !== undefined) {
    // Open lower bound, e.g. "Below 100" — only an upper ceiling matters.
    const margin = hi * OPEN_MARGIN_PCT;
    const windowHi = hi * 1.8;
    const toPct = (v: number) => (v / windowHi) * 100;

    let status: Severity;
    if (value <= hi) status = "normal";
    else if (value <= hi + margin) status = "borderline";
    else status = "high";

    return { status, marker: clampPct(toPct(value)), bandA: 0, bandB: clampPct(toPct(hi)) };
  }

  if (lo !== undefined) {
    // Open upper bound, e.g. "Above 40" — only a floor matters.
    const margin = lo * OPEN_MARGIN_PCT;
    const windowLo = lo * 0.3;
    const windowHi = lo * 1.8;
    const span = windowHi - windowLo;
    const toPct = (v: number) => ((v - windowLo) / span) * 100;

    let status: Severity;
    if (value >= lo) status = "normal";
    else if (value >= lo - margin) status = "borderline";
    else status = "low";

    return { status, marker: clampPct(toPct(value)), bandA: clampPct(toPct(lo)), bandB: 100 };
  }

  // Couldn't parse a range at all — can't classify severity responsibly.
  return { status: "normal", marker: 50, bandA: 20, bandB: 80 };
}
