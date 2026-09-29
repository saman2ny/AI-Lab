import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/client.js";
import { config } from "../../config.js";
import { sendVerificationEmail } from "./emailService.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(userId: string, email: string): Promise<{ devCode?: string }> {
  const code = generateCode();
  await sendVerificationEmail(email, code);

  const codeHash = await bcrypt.hash(code, 10);
  await prisma.otpCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return { devCode: config.devExposeOtp ? code : undefined };
}

export async function resendOtp(userId: string, email: string): Promise<{ ok: boolean; devCode?: string; message?: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (latest && Date.now() - latest.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, message: "Please wait before requesting another code." };
  }

  try {
    const result = await issueOtp(userId, email);
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Couldn't send the verification email." };
  }
}

export async function verifyOtpCode(userId: string, code: string): Promise<{ ok: boolean; message?: string }> {
  const normalizedCode = code.trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    return { ok: false, message: "Enter the 6-digit verification code." };
  }

  const latest = await prisma.otpCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { ok: false, message: "Request a new code." };
  if (latest.attempts >= MAX_ATTEMPTS) return { ok: false, message: "Too many attempts. Request a new code." };
  if (latest.expiresAt.getTime() < Date.now()) return { ok: false, message: "That code expired. Request a new one." };

  const matches = await bcrypt.compare(normalizedCode, latest.codeHash);
  if (!matches) {
    await prisma.otpCode.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, message: "That code isn't right. Try again." };
  }

  await prisma.otpCode.update({ where: { id: latest.id }, data: { consumedAt: new Date() } });
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return { ok: true };
}