import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getReport } from "../services/sessionStore/inMemoryStore.js";
import { chatReply, type ChatTurn } from "../services/ai/chatPrompt.js";

export const chatRouter = Router();

chatRouter.post("/message", requireAuth, async (req, res) => {
  const { message, history } = req.body as { message?: string; history?: ChatTurn[] };
  if (!message?.trim()) return res.status(400).json({ message: "Message is empty." });

  const report = getReport(req.auth!.sessionId);
  if (!report) return res.status(404).json({ message: "No report in this session yet." });

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
  try {
    const reply = await chatReply(report, history ?? [], message, clientIp);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : "Couldn't get a reply just now." });
  }
});
