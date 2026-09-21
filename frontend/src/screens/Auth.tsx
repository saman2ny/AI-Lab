import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { continueWithGoogle, login, register } from "../lib/api";
import { useAuthStore } from "../state/authStore";

type GoogleIdResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleIdResponse) => void;
          }) => void;

          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            }
          ) => void;
        };
      };
    };

    __GOOGLE_CLIENT_ID__?: string;
  }
}

export function Auth() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const setPendingUserId = useAuthStore((s) => s.setPendingUserId);

  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogleToken(idToken: string) {
    setBusy(true);
    setError(null);

    try {
      const result = await continueWithGoogle(idToken);

      if (!result.ok) {
        throw new Error(result.message ?? "Google sign-in failed");
      }

      await afterAuth(
        result.needsVerify,
        result.userId ? "google-user" : "you@gmail.com",
        result.userId ?? null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function afterAuth(
    needsVerify: boolean,
    authedEmail: string,
    userId?: string | null
  ) {
    if (needsVerify) {
      signIn(authedEmail, userId ?? null);
      setPendingUserId(userId ?? null);
      navigate("/verify");
    } else {
      signIn(authedEmail, userId ?? null);
      setPendingUserId(null);
      navigate("/analysing");
    }
  }

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      window.__GOOGLE_CLIENT_ID__;

    if (!clientId) {
      setError(
        "Google sign-in isn’t configured yet. Add VITE_GOOGLE_CLIENT_ID in frontend and GOOGLE_OAUTH_CLIENT_ID in backend."
      );
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        setError("Google sign-in could not be loaded.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            setError("Google sign-in did not return an ID token.");
            return;
          }

          void handleGoogleToken(response.credential);
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 420,
          }
        );
      }
    };

    const existing = document.getElementById("google-gsi-script");

    if (existing) {
      if (window.google?.accounts?.id) {
        initializeGoogle();
      } else {
        existing.addEventListener("load", initializeGoogle, { once: true });

        return () => {
          existing.removeEventListener("load", initializeGoogle);
        };
      }

      return;
    }

    const script = document.createElement("script");

    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    script.onerror = () => {
      setError("Unable to load Google sign-in.");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  async function handleSubmit(mode: "signin" | "create") {
    if (!email || password.length < 8) {
      setError(
        "Enter your email and a password with at least 8 characters."
      );
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const result =
        mode === "signin"
          ? await login(email, password)
          : await register(email, password);

      if (!result.ok) {
        throw new Error(result.message ?? "Couldn't sign you in");
      }

      await afterAuth(
        result.needsVerify,
        email,
        result.userId ?? null
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen screen-wide-pad screen-narrow screen-enter">
      <span className="eyebrow">
        REPORT RECEIVED · STEP 1 OF 2
      </span>

      <h1
        className="h-compact"
        style={{ marginTop: 10 }}
      >
        One step before we analyse
      </h1>

      <p
        className="body-text"
        style={{ marginTop: 10 }}
      >
        Results are personal health data, so we confirm it is you before explaining them.
      </p>

      <div
        ref={googleButtonRef}
        style={{
          marginTop: 22,
          minHeight: 44,
          display: "flex",
          justifyContent: "center",
        }}
      />

      <div className="divider-row">
        or use email
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div className="field">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="arun@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="at least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p
          className="upload-error"
          style={{ marginTop: 10 }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 16,
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => handleSubmit("signin")}
          disabled={busy}
        >
          Sign in
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => handleSubmit("create")}
          disabled={busy}
        >
          Create account
        </button>
      </div>

      <div
        className="note-box"
        style={{ marginTop: 22 }}
      >
        <span className="note-dot" />

        <span>
          Your upload is waiting in this session only. Nothing is written to our servers.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          marginTop: 18,
          fontSize: 13,
        }}
      >
        <Link
          to="/privacy"
          style={{
            color: "#8aa8ff",
            textDecoration: "none",
          }}
        >
          Privacy Policy
        </Link>

        <span style={{ color: "var(--ink-muted)" }}>
          ·
        </span>

        <Link
          to="/terms"
          style={{
            color: "#8aa8ff",
            textDecoration: "none",
          }}
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
}