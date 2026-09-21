import type { NavigateFunction } from "react-router-dom";
import { logout } from "./api";
import { useAuthStore } from "../state/authStore";
import { useChatStore } from "../state/chatStore";
import { useReportStore } from "../state/reportStore";
import { useUiStore } from "../state/uiStore";

export function endSession(navigate: NavigateFunction, message: string) {
  void logout();
  useReportStore.getState().clear();
  useChatStore.getState().reset();
  useAuthStore.getState().signOut();
  navigate("/");
  useUiStore.getState().showToast(message);
}
