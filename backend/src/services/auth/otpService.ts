import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/client.js";
import { sendVerificationEmail } from "./emailService.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(userId: string, email: string): Promise<{ devCode?: string }> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.otpCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendVerificationEmail(email, code);
  return { devCode: code };
}

export async function resendOtp(userId: string, email: string): Promise<{ ok: boolean; devCode?: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (latest && Date.now() - latest.lastSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false };
  }
  const result = await issueOtp(userId, email);
  return { ok: true, ...result };
}

export async function verifyOtpCode(userId: string, code: string): Promise<{ ok: boolean; message?: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { ok: false, message: "Request a new code." };
  if (latest.attempts >= MAX_ATTEMPTS) return { ok: false, message: "Too many attempts. Request a new code." };
  if (latest.expiresAt.getTime() < Date.now()) return { ok: false, message: "That code expired. Request a new one." };

  const matches = await bcrypt.compare(code, latest.codeHash);
  if (!matches) {
    await prisma.otpCode.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, message: "That code isn't right. Try again." };
  }

  await prisma.otpCode.update({ where: { id: latest.id }, data: { consumedAt: new Date() } });
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return { ok: true };
}
