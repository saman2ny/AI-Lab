import { Router } from "express";
import { prisma } from "../db/client.js";
import { config } from "../config.js";
import { hashPassword, isPasswordValid, verifyPassword } from "../services/auth/passwordService.js";
import { issueOtp, resendOtp, verifyOtpCode } from "../services/auth/otpService.js";
import { isGoogleAuthConfigured, verifyGoogleIdToken } from "../services/auth/googleOAuth.js";
import { refreshTokenExpiry, signAccessToken, signRefreshToken } from "../services/auth/jwtService.js";
import { clearSession, createSession } from "../services/sessionStore/inMemoryStore.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const authRouter = Router();

const PENDING_COOKIE = "pending_user";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: config.nodeEnv === "production" };

function setPendingCookie(res: import("express").Response, userId: string) {
  res.cookie(PENDING_COOKIE, userId, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
}

async function establishSession(res: import("express").Response, userId: string) {
  const sessionId = createSession(userId);
  const accessToken = signAccessToken({ userId, sessionId });
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: { userId, tokenHash: refreshToken, expiresAt: refreshTokenExpiry() },
  });

  res.cookie("access_token", accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.clearCookie(PENDING_COOKIE);
}

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !isPasswordValid(password ?? "")) {
    return res.status(400).json({ ok: false, message: "Enter a valid email and a password with at least 8 characters." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return res.status(409).json({ ok: false, message: "An account with that email already exists. Try signing in." });
  }

  const passwordHash = await hashPassword(password!);
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { passwordHash } })
    : await prisma.user.create({ data: { email, passwordHash } });

  const { devCode } = await issueOtp(user.id, email);
  setPendingCookie(res, user.id);
  res.json({ ok: true, needsVerify: true, userId: user.id, devCode: config.devExposeOtp ? devCode : undefined });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ ok: false, message: "Enter your email and password." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ ok: false, message: "That email and password don't match." });
  }

  const { devCode } = await issueOtp(user.id, email);
  setPendingCookie(res, user.id);
  res.json({ ok: true, needsVerify: true, userId: user.id, devCode: config.devExposeOtp ? devCode : undefined });
}));

authRouter.post("/google", asyncHandler(async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) return res.status(400).json({ ok: false, message: "Missing Google token." });

  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({ ok: false, message: "Google sign-in isn't configured on this server yet." });
  }

  try {
    const profile = await verifyGoogleIdToken(idToken);
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { googleSub: profile.sub, emailVerifiedAt: new Date() },
      create: { email: profile.email, googleSub: profile.sub, emailVerifiedAt: new Date() },
    });
    // Google already verifies the email, so this path skips OTP entirely.
    await establishSession(res, user.id);
    res.json({ ok: true, needsVerify: false, userId: user.id });
  } catch (err) {
    res.status(401).json({ ok: false, message: err instanceof Error ? err.message : "Google sign-in failed." });
  }
}));

authRouter.post("/verify", asyncHandler(async (req, res) => {
  const userIdFromCookie = req.cookies?.[PENDING_COOKIE] as string | undefined;
  const { userId: requestedUserId, code } = req.body as { userId?: string; code?: string };
  const userId = userIdFromCookie ?? requestedUserId;
  if (!userId || !code) return res.status(400).json({ ok: false, message: "Start sign-in again." });

  const result = await verifyOtpCode(userId, code);
  if (!result.ok) return res.status(400).json(result);

  await establishSession(res, userId);
  res.json({ ok: true });
}));

authRouter.post("/verify/resend", asyncHandler(async (req, res) => {
  const userId = req.cookies?.[PENDING_COOKIE] as string | undefined;
  if (!userId) return res.status(400).json({ ok: false });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(400).json({ ok: false });

  const result = await resendOtp(userId, user.email);
  res.json({ ok: result.ok, devCode: config.devExposeOtp ? result.devCode : undefined });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) return res.status(401).json({ authed: false });
  res.json({ authed: true, email: user.email, hasSeenWalkthrough: user.hasSeenWalkthrough });
}));

authRouter.post("/walkthrough-seen", requireAuth, asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.auth!.userId }, data: { hasSeenWalkthrough: true } });
  res.json({ ok: true });
}));

authRouter.post("/logout", requireAuth, (req, res) => {
  clearSession(req.auth!.sessionId);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ ok: true });
});
