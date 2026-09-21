import type { Severity } from "../types/value";
import { SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_SHAPE, SEVERITY_TINT } from "../lib/severity";

export function SeverityShapeIcon({ status, size = 8 }: { status: Severity; size?: number }) {
  const shape = SEVERITY_SHAPE[status];
  return (
    <span
      className={`severity-shape shape-${shape}`}
      style={{ width: size, height: size, background: SEVERITY_COLOR[status] }}
      aria-hidden="true"
    />
  );
}

export function SeverityTag({ status }: { status: Severity }) {
  return (
    <span
      className="severity-tag"
      style={{ background: SEVERITY_TINT[status], color: SEVERITY_COLOR[status] }}
    >
      <SeverityShapeIcon status={status} />
      {SEVERITY_LABEL[status]}
    </span>
  );
}
