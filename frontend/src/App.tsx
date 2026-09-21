import { useCallback, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { IdleWarningModal, SignOutConfirmModal } from "./components/Modals";
import { Toast } from "./components/Toast";
import { checkSession } from "./lib/api";
import { useIdleTimer } from "./lib/idleTimer";
import { endSession } from "./lib/session";
import { Analysing } from "./screens/Analysing";
import { AllValues } from "./screens/AllValues";
import { Assistant } from "./screens/Assistant";
import { Auth } from "./screens/Auth";
import { Landing } from "./screens/Landing";
import { Rating } from "./screens/Rating";
import { Scan } from "./screens/Scan";
import { Summary } from "./screens/Summary";
import { ValueDetail } from "./screens/ValueDetail";
import { Verify } from "./screens/Verify";
import { Walkthrough } from "./screens/Walkthrough";
import { useAuthStore } from "./state/authStore";
import { useUiStore } from "./state/uiStore";

function AppShell() {
  const navigate = useNavigate();
  const authed = useAuthStore((s) => s.authed);
  const idleWarningOpen = useUiStore((s) => s.idleWarningOpen);
  const setIdleWarningOpen = useUiStore((s) => s.setIdleWarningOpen);
  const signOutConfirmOpen = useUiStore((s) => s.signOutConfirmOpen);
  const setSignOutConfirmOpen = useUiStore((s) => s.setSignOutConfirmOpen);

  useEffect(() => {
    checkSession().then((info) => {
      if (info.authed && info.email) {
        useAuthStore.getState().signIn(info.email);
        if (info.hasSeenWalkthrough) useAuthStore.getState().markWalkthroughSeen();
      }
    });
  }, []);

  const handleWarn = useCallback(() => setIdleWarningOpen(true), [setIdleWarningOpen]);
  const handleExpire = useCallback(() => {
    setIdleWarningOpen(false);
    endSession(navigate, "Signed out after 15 minutes idle · your report has been cleared");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useIdleTimer(authed, handleWarn, handleExpire);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/analysing" element={<Analysing />} />
        <Route path="/walkthrough" element={<Walkthrough />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/values" element={<AllValues />} />
        <Route path="/values/:key" element={<ValueDetail />} />
        <Route path="/chat" element={<Assistant />} />
        <Route path="/rating" element={<Rating />} />
      </Routes>

      <Toast />

      {idleWarningOpen && (
        <IdleWarningModal onStay={() => setIdleWarningOpen(false)} onDismiss={() => setIdleWarningOpen(false)} />
      )}

      {signOutConfirmOpen && (
        <SignOutConfirmModal
          onCancel={() => setSignOutConfirmOpen(false)}
          onConfirm={() => {
            setSignOutConfirmOpen(false);
            endSession(navigate, "Session closed · your report has been cleared");
          }}
        />
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
