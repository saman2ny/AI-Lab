import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resendOtp, verifyOtp } from "../lib/api";
import { useAuthStore } from "../state/authStore";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function Verify() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const pendingUserId = useAuthStore((s) => s.pendingUserId);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await verifyOtp(code, pendingUserId ?? undefined);
      if (!result.ok) {
        setError(result.message ?? "That code isn't right. Try again.");
        return;
      }
      navigate("/analysing");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    await resendOtp();
    setCooldown(RESEND_COOLDOWN);
  }

  return (
    <div className="screen screen-wide-pad screen-narrow screen-enter">
      <span className="eyebrow">REPORT RECEIVED · STEP 2 OF 2</span>
      <h1 className="h-compact" style={{ marginTop: 10 }}>
        Check your email
      </h1>
      <p className="body-text" style={{ marginTop: 10 }}>
        We sent a 6-digit code to {email ?? "your email"}. It expires in 10 minutes.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            style={{
              flex: 1,
              aspectRatio: "1",
              maxWidth: 58,
              borderRadius: 11,
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              border: `1px solid ${d ? "var(--accent)" : "var(--border-strong)"}`,
            }}
          />
        ))}
      </div>

      {error && <p className="upload-error" style={{ marginTop: 12 }}>{error}</p>}

      <button className="btn-text" style={{ marginTop: 14 }} onClick={handleResend} disabled={cooldown > 0}>
        {cooldown > 0 ? `Didn't arrive? Resend in 0:${cooldown.toString().padStart(2, "0")}` : "Resend code"}
      </button>

      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={handleVerify} disabled={busy}>
        Verify and analyse
      </button>
    </div>
  );
}
