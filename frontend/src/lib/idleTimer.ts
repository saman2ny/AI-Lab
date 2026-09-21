import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000; // warn at 13 min

const ACTIVITY_EVENTS = ["mousemove", "keydown", "touchstart", "visibilitychange"] as const;

export function useIdleTimer(active: boolean, onWarn: () => void, onExpire: () => void) {
  const warnTimer = useRef<ReturnType<typeof setTimeout>>();
  const expireTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) return;

    const reset = () => {
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (expireTimer.current) clearTimeout(expireTimer.current);
      warnTimer.current = setTimeout(onWarn, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
      expireTimer.current = setTimeout(onExpire, IDLE_TIMEOUT_MS);
    };

    reset();
    ACTIVITY_EVENTS.forEach((evt) => document.addEventListener(evt, reset));

    return () => {
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (expireTimer.current) clearTimeout(expireTimer.current);
      ACTIVITY_EVENTS.forEach((evt) => document.removeEventListener(evt, reset));
    };
  }, [active, onWarn, onExpire]);
}
