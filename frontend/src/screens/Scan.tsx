import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/authStore";
import { useReportStore } from "../state/reportStore";

export function Scan() {
  const navigate = useNavigate();
  const authed = useAuthStore((s) => s.authed);
  const setPendingUploadIntent = useAuthStore((s) => s.setPendingUploadIntent);
  const setPendingFiles = useReportStore((s) => s.setPendingFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCapture(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPendingFiles(Array.from(files));
    if (authed) {
      navigate("/analysing");
    } else {
      setPendingUploadIntent(true);
      navigate("/auth");
    }
  }

  return (
    <div className="scan-screen screen-enter">
      <div className="scan-header">
        <button onClick={() => navigate("/")}>Cancel</button>
        <span>Scan report</span>
        <span style={{ width: 50 }} />
      </div>
      <div className="viewfinder">
        <span>Align the whole page inside the frame</span>
        <span className="corner-bracket tl" />
        <span className="corner-bracket tr" />
        <span className="corner-bracket bl" />
        <span className="corner-bracket br" />
      </div>
      <div className="scan-footer">
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)" }}>Flash</button>
        <button className="shutter" onClick={() => inputRef.current?.click()} aria-label="Capture" />
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)" }}>Gallery</button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => handleCapture(e.target.files)}
      />
    </div>
  );
}
