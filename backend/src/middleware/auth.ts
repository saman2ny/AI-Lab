import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/auth/jwtService.js";
import { touchSession } from "../services/sessionStore/inMemoryStore.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { userId: string; sessionId: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token as string | undefined;
  if (!token) return res.status(401).json({ message: "Not signed in." });

  const payload = verifyAccessToken(token);
  if (!payload) return res.status(401).json({ message: "Session expired." });

  if (!touchSession(payload.sessionId)) {
    return res.status(401).json({ message: "Session expired." });
  }

  req.auth = payload;
  next();
}
