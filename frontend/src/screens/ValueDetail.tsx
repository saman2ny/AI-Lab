import { useNavigate, useParams } from "react-router-dom";
import { Disclaimer } from "../components/Disclaimer";
import { RangeBar } from "../components/RangeBar";
import { SeverityTag } from "../components/SeverityTag";
import { TopBar } from "../components/TopBar";
import { useChatStore } from "../state/chatStore";
import { useReportStore } from "../state/reportStore";

export function ValueDetail() {
  const navigate = useNavigate();
  const { key } = useParams();
  const byKey = useReportStore((s) => s.byKey);
  const value = key ? byKey(key) : undefined;
  const queueQuestion = useChatStore((s) => s.queueQuestion);

  if (!value) {
    navigate("/values");
    return null;
  }

  return (
    <div className="screen screen-enter">
      <TopBar title={value.name} onBack={() => navigate("/values")} />

      <div className="two-col">
        <div className="text-col">
          <h1 className="h-screen">{value.plain}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <SeverityTag status={value.status} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-muted)" }}>
              {value.ref}
            </span>
          </div>
          <div className="value-card-value value-large">
            {value.value}
            <span className="value-card-unit">{value.unit}</span>
          </div>
          <RangeBar value={value} size="md" />
          <div className="rule">
            <span className="eyebrow">WHAT IT MEANS</span>
            <p className="body-text" style={{ marginTop: 8 }}>
              {value.meaning}
            </p>
          </div>
        </div>

        <div className="card">
          <span className="eyebrow">WHAT HELPS</span>
          <ul className="helps-list">
            {value.helps.map((h) => (
              <li key={h}>
                <span className="helps-dot" />
                {h}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-tertiary"
            style={{ marginTop: 16, width: "100%" }}
            onClick={() => {
              queueQuestion(`What should I know about my ${value.name}?`);
              navigate("/chat");
            }}
          >
            Ask the assistant about this
          </button>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
