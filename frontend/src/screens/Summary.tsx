import { useNavigate } from "react-router-dom";
import { Disclaimer } from "../components/Disclaimer";
import { SeverityShapeIcon } from "../components/SeverityTag";
import { TopBar } from "../components/TopBar";
import { pdfExportUrl } from "../lib/api";
import { SEVERITY_COLOR, SEVERITY_TINT } from "../lib/severity";
import { useChatStore } from "../state/chatStore";
import { useReportStore } from "../state/reportStore";
import { useUiStore } from "../state/uiStore";


export function Summary() {
  const navigate = useNavigate();
  const status = useReportStore((s) => s.status);
  const meta = useReportStore((s) => s.meta);
  const counts = useReportStore((s) => s.counts)();
  const flagged = useReportStore((s) => s.flagged)();
  const showToast = useUiStore((s) => s.showToast);
  const setSignOutConfirmOpen = useUiStore((s) => s.setSignOutConfirmOpen);

  if (status === "empty") {
    return (
      <div className="screen screen-medium screen-enter" style={{ justifyContent: "center" }}>
        <div className="empty-state">
          <h1 className="h-compact">We couldn't recognise any values</h1>
          <p className="body-text">
            The file uploaded, but we couldn't match anything to a lab value. Try a clearer photo, or a
            different file.
          </p>
          <button className="btn btn-primary" style={{ width: "auto", padding: "0 28px" }} onClick={() => navigate("/")}>
            Upload another report
          </button>
        </div>
      </div>
    );
  }

  function handleSavePdf() {
    window.open(pdfExportUrl(), "_blank");
    showToast("Saved to your device · report still in session");
  }

  function openChat(pending?: string) {
    if (pending) useChatStore.getState().queueQuestion(pending);
    navigate("/chat");
  }

  return (
    <div className="screen screen-enter">
      <TopBar
        title="Your summary"
        onBack={() => navigate("/walkthrough")}
        action={
          <button className="btn-muted-text" onClick={() => setSignOutConfirmOpen(true)}>
            Sign out
          </button>
        }
      />

      <h1 className="h-screen">
        {counts.attention} value{counts.attention === 1 ? "" : "s"} to act on, {counts.watch} to watch
      </h1>
      <p className="body-text screen-body-max" style={{ marginTop: 10 }}>
        Nothing here is urgent. Take this page to your next appointment — it is the whole report on one
        screen.
      </p>

      <div className="triage-grid">
        <div className="triage-card" style={{ background: SEVERITY_TINT.high, border: `1px solid ${SEVERITY_COLOR.high}38` }}>
          <SeverityShapeIcon status="high" size={14} />
          <span className="triage-label">Needs attention</span>
          <span className="triage-count" style={{ color: SEVERITY_COLOR.high }}>
            {counts.attention}
          </span>
        </div>
        <div
          className="triage-card"
          style={{ background: SEVERITY_TINT.borderline, border: `1px solid ${SEVERITY_COLOR.borderline}38` }}
        >
          <SeverityShapeIcon status="borderline" size={14} />
          <span className="triage-label">Keep an eye on</span>
          <span className="triage-count" style={{ color: SEVERITY_COLOR.borderline }}>
            {counts.watch}
          </span>
        </div>
        <div
          className="triage-card"
          style={{ background: SEVERITY_TINT.normal, border: `1px solid ${SEVERITY_COLOR.normal}38` }}
        >
          <SeverityShapeIcon status="normal" size={14} />
          <span className="triage-label">In range</span>
          <span className="triage-count" style={{ color: SEVERITY_COLOR.normal }}>
            {counts.inRange}
          </span>
        </div>
      </div>

      <div className="card">
        <span className="eyebrow">What we flagged</span>
        {flagged.map((v) => (
          <div key={v.key} className="flagged-row" onClick={() => navigate(`/values/${v.key}`)}>
            <SeverityShapeIcon status={v.status} size={13} />
            <div style={{ flex: 1 }}>
              <div className="flagged-row-name">{v.name}</div>
              <div className="flagged-row-sub">{v.helps[0]}</div>
            </div>
            <span className="flagged-row-value">{v.value}</span>
            <span className="chevron">›</span>
          </div>
        ))}
      </div>

      <div className="actions-grid">
        <button className="btn btn-primary" onClick={handleSavePdf}>
          Save as PDF
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/values")}>
          See all values
        </button>
        <button className="btn btn-secondary" onClick={() => openChat()}>
          Ask about my results
        </button>
      </div>

      <Disclaimer />
    </div>
  );
}
