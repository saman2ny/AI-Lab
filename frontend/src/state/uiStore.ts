import { create } from "zustand";

interface UiState {
  toast: string | null;
  idleWarningOpen: boolean;
  signOutConfirmOpen: boolean;
  showToast: (message: string) => void;
  clearToast: () => void;
  setIdleWarningOpen: (v: boolean) => void;
  setSignOutConfirmOpen: (v: boolean) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  idleWarningOpen: false,
  signOutConfirmOpen: false,
  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 2800);
  },
  clearToast: () => set({ toast: null }),
  setIdleWarningOpen: (v) => set({ idleWarningOpen: v }),
  setSignOutConfirmOpen: (v) => set({ signOutConfirmOpen: v }),
}));
