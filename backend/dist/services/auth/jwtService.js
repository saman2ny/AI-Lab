import jwt from "jsonwebtoken";
import { config } from "../../config.js";
// Access token lifetime deliberately matches the idle-timeout promise: once
// it expires, the frontend must re-authenticate, which lines up with the
// backend's own in-memory session sweep.
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export function signAccessToken(payload) {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    }
    catch {
        return null;
    }
}
export function signRefreshToken(userId) {
    return jwt.sign({ userId }, config.refreshTokenSecret, {
        expiresIn: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
    });
}
export function refreshTokenExpiry() {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}
