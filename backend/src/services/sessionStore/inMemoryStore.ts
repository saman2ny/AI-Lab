import { randomUUID } from "node:crypto";
import { config } from "../../config.js";

export interface StoredLabValue {
  key: string;
  name: string;
  value: string;
  unit: string;
  status: "high" | "low" | "borderline" | "normal";
  ref: string;
  marker: number;
  bandA: number;
  bandB: number;
  plain: string;
  meaning: string;
  helps: string[];
  category?: string;
}

export interface SessionReport {
  meta: { label: string; date: string };
  values: StoredLabValue[];
  walkthroughKeys: string[];
}

interface SessionRecord {
  userId: string;
  report: SessionReport | null;
  lastActivityAt: number;
}

// This Map is the entire enforcement mechanism for "the extracted report is
// never persisted": it is the only place report content is ever held, it
// lives only in this process's memory, and it is swept on a timer. Nothing
// in here is ever written to the database.
const sessions = new Map<string, SessionRecord>();

export function createSession(userId: string): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, { userId, report: null, lastActivityAt: Date.now() });
  return sessionId;
}

export function touchSession(sessionId: string): boolean {
  const s = sessions.get(sessionId);
  if (!s) return false;
  s.lastActivityAt = Date.now();
  return true;
}

export function getSession(sessionId: string): SessionRecord | undefined {
  return sessions.get(sessionId);
}

export function setReport(sessionId: string, report: SessionReport) {
  const s = sessions.get(sessionId);
  if (!s) return;
  s.report = report;
  s.lastActivityAt = Date.now();
}

export function getReport(sessionId: string): SessionReport | null {
  return sessions.get(sessionId)?.report ?? null;
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}

export function sweepIdleSessions() {
  const now = Date.now();
  for (const [id, record] of sessions) {
    if (now - record.lastActivityAt > config.idleTimeoutMs) {
      sessions.delete(id);
    }
  }
}

let sweepTimer: ReturnType<typeof setInterval> | null = null;

export function startSessionSweeper() {
  if (sweepTimer) return;
  sweepTimer = setInterval(sweepIdleSessions, 60_000);
  sweepTimer.unref?.();
}
