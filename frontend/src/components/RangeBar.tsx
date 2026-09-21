import type { LabValue } from "../types/value";
import { SEVERITY_COLOR } from "../lib/severity";

export function RangeBar({ value, size = "sm" }: { value: LabValue; size?: "sm" | "md" }) {
  return (
    <div className="range-bar-wrap">
      <div className={`range-bar-track size-${size}`}>
        <div
          className="range-bar-band"
          style={{ left: `${value.bandA}%`, width: `${Math.max(value.bandB - value.bandA, 0)}%` }}
        />
        <div
          className="range-bar-marker"
          style={{
            left: `${value.marker}%`,
            height: size === "sm" ? 20 : 22,
            background: SEVERITY_COLOR[value.status],
          }}
        />
      </div>
      <div className="range-bar-captions">
        <span>normal range</span>
        <span className="range-bar-you" style={{ left: `${value.marker}%`, color: SEVERITY_COLOR[value.status] }}>
          you
        </span>
      </div>
    </div>
  );
}
