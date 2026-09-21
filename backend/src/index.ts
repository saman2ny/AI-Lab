import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { ratingRouter } from "./routes/rating.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { startSessionSweeper } from "./services/sessionStore/inMemoryStore.js";

const app = express();

app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/reports", reportRouter);
app.use("/api/chat", chatRouter);
app.use("/api/rating", ratingRouter);

app.use(errorHandler);

startSessionSweeper();

app.listen(config.port, () => {
  console.log(`Lab Explainer backend listening on http://localhost:${config.port}`);
  console.log(`MOCK_AI=${config.mockAi} · Google OAuth ${config.googleOAuthClientId ? "configured" : "disabled"}`);
});
