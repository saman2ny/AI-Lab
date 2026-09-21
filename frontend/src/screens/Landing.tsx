import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLockup, Disclaimer } from "../components/Disclaimer";
import { useAuthStore } from "../state/authStore";
import { useReportStore } from "../state/reportStore";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export function Landing() {
  const navigate = useNavigate();
  const authed = useAuthStore((s) => s.authed);
  const setPendingUploadIntent = useAuthStore((s) => s.setPendingUploadIntent);
  const setPendingFiles = useReportStore((s) => s.setPendingFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const invalid = list.find((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid) {
      setError(`"${invalid.name}" isn't a PDF, Word file or photo. Try a different file.`);
      return;
    }
    setError(null);
    setPendingFiles(list);
    if (authed) {
      navigate("/analysing");
    } else {
      setPendingUploadIntent(true);
      navigate("/auth");
    }
  }

  return (
    <div className="screen screen-wide-pad screen-enter">
      <BrandLockup />
      <div className="landing-grid" style={{ marginTop: 30 }}>
        <div className="landing-col">
          <h1 className="h-hero">Your lab report, in plain English.</h1>
          <p className="body-text">
            Upload it once. We explain every value, flag what needs attention, and tell you what
            actually helps.
          </p>
          <div className="chip-row">
            <span className="file-chip">PDF</span>
            <span className="file-chip">WORD</span>
            <span className="file-chip">PHOTO</span>
          </div>
        </div>
        <div className="landing-col">
          <div className="dropzone" onClick={() => inputRef.current?.click()}>
            <div className="dropzone-icon">↑</div>
            <p className="dropzone-title">Upload report</p>
            <p className="dropzone-sub">Tap to choose a PDF, Word file or photo</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {error && <p className="upload-error">{error}</p>}
          <button className="btn btn-secondary mobile-only" onClick={() => navigate("/scan")}>
            Scan with camera
          </button>
          <div className="note-box">
            <span className="note-dot" />
            <span>We never store your report. It is cleared when you sign out or after 15 minutes idle.</span>
          </div>
        </div>
      </div>
      <Disclaimer pinned />
    </div>
  );
}
