import { useNavigate } from "react-router-dom";
import { SeverityShapeIcon } from "../components/SeverityTag";
import { TopBar } from "../components/TopBar";
import { pdfExportUrl } from "../lib/api";
import { useReportStore } from "../state/reportStore";
import { useUiStore } from "../state/uiStore";

const LARGE_PANEL_THRESHOLD = 12;

export function AllValues() {
  const navigate = useNavigate();
  const meta = useReportStore((s) => s.meta);
  const values = useReportStore((s) => s.values);
  const flagged = useReportStore((s) => s.flagged)();
  const showAll = useReportStore((s) => s.showAll);
  const setShowAll = useReportStore((s) => s.setShowAll);
  const showToast = useUiStore((s) => s.showToast);

  const visible = showAll ? values : flagged;
  const grouped = values.length > LARGE_PANEL_THRESHOLD;

  function handleSavePdf() {
    window.open(pdfExportUrl(), "_blank");
    showToast("Saved to your device · report still in session");
  }

  function renderRow(v: (typeof values)[number]) {
    return (
      <div key={v.key} className="value-row" onClick={() => navigate(`/values/${v.key}`)}>
        <SeverityShapeIcon status={v.status} size={14} />
        <div className="value-row-main">
          <div className="value-row-name">{v.name}</div>
          <div className="value-row-sub">{v.plain}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="value-row-value">{v.value}</div>
          <div className="value-row-unit">{v.unit}</div>
        </div>
        <span className="chevron">›</span>
      </div>
    );
  }

  const rows = grouped
    ? Object.entries(
        visible.reduce<Record<string, typeof values>>((acc, v) => {
          const cat = v.category ?? "Other";
          (acc[cat] ??= []).push(v);
          return acc;
        }, {})
      ).map(([category, items]) => (
        <div key={category}>
          <div className="category-heading">{category}</div>
          <div className="value-rows">{items.map(renderRow)}</div>
        </div>
      ))
    : <div className="value-rows">{visible.map(renderRow)}</div>;

  return (
    <div className="screen screen-enter">
      <TopBar
        title={`${meta?.label ?? "Report"} · ${meta?.date ?? ""}`}
        onBack={() => navigate("/summary")}
        action={
          <button className="btn-text" onClick={handleSavePdf}>
            Save as PDF
          </button>
        }
      />

      <div className="chip-row" style={{ marginBottom: 18 }}>
        <button className={`filter-chip${!showAll ? " active" : ""}`} onClick={() => setShowAll(false)}>
          Flagged · {flagged.length}
        </button>
        <button className={`filter-chip${showAll ? " active" : ""}`} onClick={() => setShowAll(true)}>
          All values · {values.length}
        </button>
      </div>

      {rows}

      <div className="actions-grid">
        <button className="btn btn-primary" onClick={() => navigate("/chat")}>
          Ask about my results
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/summary")}>
          Back to summary
        </button>
      </div>
    </div>
  );
}
