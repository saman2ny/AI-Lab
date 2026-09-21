import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitRating } from "../lib/api";
import { endSession } from "../lib/session";

export function Rating() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    try {
      await submitRating(score, comment);
    } finally {
      setBusy(false);
      endSession(navigate, "Session closed · your report has been cleared");
    }
  }

  return (
    <div className="screen screen-wide-pad screen-narrow screen-enter" style={{ justifyContent: "center" }}>
      <h1 className="h-compact">Did this help you understand your report?</h1>

      <div className="rating-circles">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`rating-circle${n <= score ? " selected" : ""}`}
            onClick={() => setScore(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="rating-captions">
        <span>Not really</span>
        <span>Completely</span>
      </div>

      <div className="field">
        <textarea
          placeholder="Anything we explained badly? (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ minHeight: 86, resize: "vertical" }}
        />
      </div>

      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSubmit} disabled={busy || score === 0}>
        Submit and close session
      </button>

      <div className="note-box" style={{ marginTop: 16 }}>
        <span className="note-dot" />
        <span>Closing the session clears the extracted report from memory. Nothing remains on our side.</span>
      </div>
    </div>
  );
}
