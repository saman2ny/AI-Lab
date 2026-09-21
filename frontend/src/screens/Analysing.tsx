import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReport } from "../lib/api";
import { useAuthStore } from "../state/authStore";
import { useReportStore } from "../state/reportStore";

const STEP_LABELS = [
  "Reading your report",
  "Matching each value to its reference range",
  "Writing your explanations",
];

export function Analysing() {
  const navigate = useNavigate();
  const pendingFiles = useReportStore((s) => s.pendingFiles);
  const setAnalysing = useReportStore((s) => s.setAnalysing);
  const setReport = useReportStore((s) => s.setReport);
  const setEmpty = useReportStore((s) => s.setEmpty);
  const setError = useReportStore((s) => s.setError);
  const error = useReportStore((s) => s.error);
  const hasSeenWalkthrough = useAuthStore((s) => s.hasSeenWalkthrough);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAnalysing();
    setStep(0);

    const stepTimer1 = setTimeout(() => !cancelled && setStep(1), 900);
    const stepTimer2 = setTimeout(() => !cancelled && setStep(2), 1800);

    async function run() {
      const result = await uploadReport(pendingFiles);
      if (cancelled) return;
      if (result.status === "empty") {
        setEmpty();
        navigate("/summary");
        return;
      }
      if (result.status === "error") {
        setError(result.message ?? "We couldn't read that report.");
        return;
      }
      if (result.meta && result.values) {
        setReport(result.meta, result.values, result.walkthroughKeys ?? []);
        navigate(hasSeenWalkthrough ? "/values" : "/walkthrough");
      }
    }
    run();

    return () => {
      cancelled = true;
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="screen screen-medium screen-enter" style={{ justifyContent: "center" }}>
        <div className="empty-state">
          <h1 className="h-compact">We couldn't read that report</h1>
          <p className="body-text">{error}</p>
          <button className="btn btn-primary" style={{ width: "auto", padding: "0 28px" }} onClick={() => navigate("/")}>
            Try another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-medium screen-enter" style={{ justifyContent: "center" }}>
      <h1 className="h-compact">Reading your report</h1>
      <div className="analysing-steps">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`analysing-step${i < step || (i === step && step === 2) ? " done" : ""}`}>
            <span className={`step-circle${i < step ? " done" : ""}`}>{i < step ? "✓" : ""}</span>
            {label}
          </div>
        ))}
      </div>
      <div className="progress-track">
        <div className="progress-fill" />
      </div>
      <p className="body-text" style={{ marginTop: 16 }}>
        Usually 10–20 seconds. Keep this window open.
      </p>
    </div>
  );
}
