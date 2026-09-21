import { randomUUID } from "node:crypto";
import { config } from "../../config.js";
// This Map is the entire enforcement mechanism for "the extracted report is
// never persisted": it is the only place report content is ever held, it
// lives only in this process's memory, and it is swept on a timer. Nothing
// in here is ever written to the database.
const sessions = new Map();
export function createSession(userId) {
    const sessionId = randomUUID();
    sessions.set(sessionId, { userId, report: null, lastActivityAt: Date.now() });
    return sessionId;
}
export function touchSession(sessionId) {
    const s = sessions.get(sessionId);
    if (!s)
        return false;
    s.lastActivityAt = Date.now();
    return true;
}
export function getSession(sessionId) {
    return sessions.get(sessionId);
}
export function setReport(sessionId, report) {
    const s = sessions.get(sessionId);
    if (!s)
        return;
    s.report = report;
    s.lastActivityAt = Date.now();
}
export function getReport(sessionId) {
    return sessions.get(sessionId)?.report ?? null;
}
export function clearSession(sessionId) {
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
let sweepTimer = null;
export function startSessionSweeper() {
    if (sweepTimer)
        return;
    sweepTimer = setInterval(sweepIdleSessions, 60_000);
    sweepTimer.unref?.();
}
