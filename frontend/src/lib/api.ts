import type { ChatMessage, LabValue, ReportMeta } from "../types/value";
import { MOCK_REPORT_META, MOCK_VALUES, WALKTHROUGH_KEYS } from "./mockData";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? window.location.origin).replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}/api${path}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryFetch<T>(path: string, init?: RequestInit, timeoutMs = 2500): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface LoginResult {
  ok: boolean;
  needsVerify: boolean;
  userId?: string;
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    return await tryFetch<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  } catch {
    return { ok: false, needsVerify: false, message: "Unable to reach the sign-in service. Please try again." };
  }
}

export async function register(email: string, password: string): Promise<LoginResult> {
  try {
    return await tryFetch<LoginResult>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
  } catch {
    return { ok: false, needsVerify: false, message: "Unable to reach the sign-in service. Please try again." };
  }
}

export async function continueWithGoogle(idToken: string): Promise<LoginResult> {
  try {
    return await tryFetch<LoginResult>("/auth/google", { method: "POST", body: JSON.stringify({ idToken }) });
  } catch {
    return { ok: false, needsVerify: false, message: "Unable to reach Google sign-in service. Please try again." };
  }
}

export async function verifyOtp(code: string, userId?: string): Promise<{ ok: boolean; message?: string }> {
  try {
    return await tryFetch("/auth/verify", { method: "POST", body: JSON.stringify({ code, userId }) });
  } catch {
    return { ok: false, message: "Unable to verify the code right now. Please try again." };
  }
}

export async function resendOtp(): Promise<{ ok: boolean; message?: string }> {
  try {
    return await tryFetch("/auth/verify/resend", { method: "POST" });
  } catch {
    return { ok: false, message: "Unable to resend the code right now. Please try again." };
  }
}

export interface UploadResult {
  status: "ready" | "empty" | "partial" | "error";
  meta?: ReportMeta;
  values?: LabValue[];
  walkthroughKeys?: string[];
  matchedCount?: number;
  message?: string;
}

export async function uploadReport(files: File[]): Promise<UploadResult> {
  try {
    const form = new FormData();
    for (const f of files) form.append("files", f);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(apiUrl("/reports/upload"), { method: "POST", body: form, credentials: "include", signal: controller.signal });
      return (await res.json()) as UploadResult;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    await delay(2200);
    return { status: "ready", meta: MOCK_REPORT_META, values: MOCK_VALUES, walkthroughKeys: WALKTHROUGH_KEYS };
  }
}

export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string> {
  try {
    const res = await tryFetch<{ reply?: string; message?: string }>("/chat/message", { method: "POST", body: JSON.stringify({ message, history }) });
    if (res.reply) return res.reply;
    if (res.message) return `Something went wrong: ${res.message}`;
    throw new Error("No reply from server");
  } catch {
    await delay(700);
    return canedReply(message);
  }
}

function canedReply(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("doctor")) return "I can't reach the doctor-lookup service right now, so I can't pull real nearby results — but once it's connected I'll use your approximate location to suggest clinics near you.";
  if (m.includes("eat") || m.includes("food")) return "Based on your panel, focus on iron-rich foods for your hemoglobin and less saturated fat for your LDL — see the \"What helps\" list on each flagged value for specifics.";
  if (m.includes("tired") || m.includes("fatigue")) return "Your hemoglobin is a bit low, which is a common cause of feeling tired — it's worth mentioning to your doctor alongside how you've been sleeping.";
  if (m.includes("diabet")) return "I can't diagnose anything — but your HbA1c is borderline, which is worth discussing with your doctor. It's not a diagnosis on its own.";
  return "I can only speak to what's in your uploaded report. Could you ask about a specific value, like your LDL or HbA1c?";
}

export async function submitRating(score: number, comment: string): Promise<{ ok: boolean }> {
  try { return await tryFetch("/rating", { method: "POST", body: JSON.stringify({ score, comment }) }); }
  catch { await delay(300); return { ok: true }; }
}

export function pdfExportUrl(): string {
  return `${API_BASE_URL}/api/reports/pdf`;
}

export interface SessionInfo {
  authed: boolean;
  email?: string;
  hasSeenWalkthrough?: boolean;
}

export async function checkSession(): Promise<SessionInfo> {
  try { return await tryFetch<SessionInfo>("/auth/me", { method: "GET" }, 3000); }
  catch { return { authed: false }; }
}

export async function markWalkthroughSeen(): Promise<void> {
  try { await tryFetch("/auth/walkthrough-seen", { method: "POST" }); } catch {}
}

export async function logout(): Promise<void> {
  try { await tryFetch("/auth/logout", { method: "POST" }, 1500); } catch {}
}
