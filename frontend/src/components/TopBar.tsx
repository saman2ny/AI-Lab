import type { ReactNode } from "react";

export function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="top-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button className="top-bar-back" onClick={onBack} aria-label="Back">
            ‹
          </button>
        )}
        <span className="top-bar-title">{title}</span>
      </div>
      {action}
    </div>
  );
}
