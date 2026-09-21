import { create } from "zustand";

interface AuthState {
  authed: boolean;
  email: string | null;
  pendingUserId: string | null;
  pendingUploadIntent: boolean;
  hasSeenWalkthrough: boolean;
  setPendingUploadIntent: (v: boolean) => void;
  setPendingUserId: (userId: string | null) => void;
  signIn: (email: string, userId?: string | null) => void;
  signOut: () => void;
  markWalkthroughSeen: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authed: false,
  email: null,
  pendingUserId: null,
  pendingUploadIntent: false,
  hasSeenWalkthrough: false,
  setPendingUploadIntent: (v) => set({ pendingUploadIntent: v }),
  setPendingUserId: (userId) => set({ pendingUserId: userId }),
  signIn: (email, userId = null) => set({ authed: true, email, pendingUserId: userId }),
  signOut: () => set({ authed: false, email: null, pendingUserId: null }),
  markWalkthroughSeen: () => set({ hasSeenWalkthrough: true }),
}));
