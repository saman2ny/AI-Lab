import { useUiStore } from "../state/uiStore";

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}
