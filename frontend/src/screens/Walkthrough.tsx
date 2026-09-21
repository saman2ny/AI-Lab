import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressDots } from "../components/ProgressDots";
import { RangeBar } from "../components/RangeBar";
import { SeverityTag } from "../components/SeverityTag";
import { TopBar } from "../components/TopBar";
import { markWalkthroughSeen as persistWalkthroughSeen } from "../lib/api";
import { useAuthStore } from "../state/authStore";
import { useReportStore } from "../state/reportStore";

export function Walkthrough() {
  const navigate = useNavigate();
  const meta = useReportStore((s) => s.meta);
  const walkthroughKeys = useReportStore((s) => s.walkthroughKeys);
  const byKey = useReportStore((s) => s.byKey);
  const markWalkthroughSeen = useAuthStore((s) => s.markWalkthroughSeen);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, []);

  if (walkthroughKeys.length === 0) {
    navigate("/values");
    return null;
  }

  const value = byKey(walkthroughKeys[step]);
  if (!value) return null;

  const isLast = step === walkthroughKeys.length - 1;

  function goNext() {
    if (isLast) {
      markWalkthroughSeen();
      void persistWalkthroughSeen();
      navigate("/summary");
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="screen screen-enter">
      <TopBar
        title={`${meta?.label ?? "Report"} · walkthrough ${step + 1} of ${walkthroughKeys.length}`}
        action={
          <button
            className="btn-text"
            onClick={() => {
              markWalkthroughSeen();
              void persistWalkthroughSeen();
              navigate("/values");
            }}
          >
            Skip to all values
          </button>
        }
      />
      <ProgressDots total={walkthroughKeys.length} current={step} />

      <div className="two-col">
        <div className="text-col">
          <h1 className="h-screen">{value.plain}</h1>
          <p className="body-text">{value.meaning}</p>
          <div className="rule">
            <span className="eyebrow">WHAT HELPS</span>
            <ul className="helps-list">
              {value.helps.map((h) => (
                <li key={h}>
                  <span className="helps-dot" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="value-card">
          <span className="value-card-name">{value.name}</span>
          <div className="value-card-value">
            {value.value}
            <span className="value-card-unit">{value.unit}</span>
          </div>
          <SeverityTag status={value.status} />
          <RangeBar value={value} size="sm" />
          <span className="value-card-footer">Reference: {value.ref}</span>
        </div>
      </div>

      <div className="nav-footer">
        {step > 0 && (
          <button className="nav-back" onClick={() => setStep((s) => s - 1)} aria-label="Previous value">
            ‹
          </button>
        )}
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={goNext}>
          {isLast ? "See my summary" : `Next: ${byKey(walkthroughKeys[step + 1])?.name ?? ""}`}
        </button>
      </div>
    </div>
  );
}
