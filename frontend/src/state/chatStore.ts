import { create } from "zustand";
import type { ChatMessage } from "../types/value";

interface ChatState {
  thread: ChatMessage[];
  busy: boolean;
  pendingQuestion: string | null;
  queueQuestion: (text: string) => void;
  consumePendingQuestion: () => string | null;
  addMessage: (msg: ChatMessage) => void;
  setBusy: (v: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  thread: [],
  busy: false,
  pendingQuestion: null,
  queueQuestion: (text) => set({ pendingQuestion: text }),
  consumePendingQuestion: () => {
    const q = get().pendingQuestion;
    set({ pendingQuestion: null });
    return q;
  },
  addMessage: (msg) => set((s) => ({ thread: [...s.thread, msg] })),
  setBusy: (v) => set({ busy: v }),
  reset: () => set({ thread: [], busy: false, pendingQuestion: null }),
}));
