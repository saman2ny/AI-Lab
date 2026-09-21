import { verifyAccessToken } from "../services/auth/jwtService.js";
import { touchSession } from "../services/sessionStore/inMemoryStore.js";
export function requireAuth(req, res, next) {
    const token = req.cookies?.access_token;
    if (!token)
        return res.status(401).json({ message: "Not signed in." });
    const payload = verifyAccessToken(token);
    if (!payload)
        return res.status(401).json({ message: "Session expired." });
    if (!touchSession(payload.sessionId)) {
        return res.status(401).json({ message: "Session expired." });
    }
    req.auth = payload;
    next();
}
