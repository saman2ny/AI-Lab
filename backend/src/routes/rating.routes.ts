import { Router } from "express";
import { prisma } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import { getReport } from "../services/sessionStore/inMemoryStore.js";
import { encryptText } from "../services/encryption.js";

export const ratingRouter = Router();

ratingRouter.post("/", requireAuth, async (req, res) => {
  const { score, comment } = req.body as { score?: number; comment?: string };
  if (!score || score < 1 || score > 5) return res.status(400).json({ ok: false, message: "Rating must be 1-5." });

  const report = getReport(req.auth!.sessionId);
  const meta = report
    ? JSON.stringify({
        valuesCount: report.values.length,
        flaggedCount: report.values.filter((v) => v.status === "high" || v.status === "low").length,
      })
    : null;

  try {
    await prisma.rating.create({
      data: {
        userId: req.auth!.userId,
        score,
        comment: comment?.trim() ? encryptText(comment.trim()) : null,
        meta,
      },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err instanceof Error ? err.message : "Couldn't save that rating." });
  }
});
