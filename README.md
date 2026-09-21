# Lab Report Explainer

A consumer webapp that turns an uploaded lab report (PDF / Word / photo) into plain-English, colour+shape-coded explanations, with a grounded chatbot for follow-up questions.

Full product/implementation plan: see the PRD this was built from and the design handoff in `Deliverable and platform selection.zip` on the Desktop.

## Stack

- **Frontend**: React 18 + Vite + TypeScript, React Router, Zustand — `frontend/`
- **Backend**: Node + Express + TypeScript — `backend/`
- **Database**: SQLite via Prisma for local dev (zero-install). Swap `DATABASE_URL` to a real Postgres instance for production — the schema avoids Postgres-only features so it's a config change, not a rewrite.

## Running locally

```bash
cd backend
npm install
npx prisma migrate dev   # first time only, creates dev.db
npm run dev              # http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173. The app works fully out of the box with **zero API keys** — see below.

## What's real vs. mocked without API keys

Every external integration is env-var driven with a graceful fallback, documented in `backend/.env.example`:

| Feature | Without a key | With a key |
|---|---|---|
| Lab value extraction, explanations, chat | Uses a built-in sample dataset (`MOCK_AI=true` by default) | Set `ANTHROPIC_API_KEY` and `MOCK_AI=false` for real Claude-powered extraction/explanations/chat |
| Google sign-in | Button calls a server that returns "not configured" | Set `GOOGLE_OAUTH_CLIENT_ID` |
| Email verification code | Logged to the backend console (and echoed in the API response in dev) | Set `SMTP_*` vars |
| "Find a doctor near me" | Graceful "can't look this up right now" chat reply | Set `GOOGLE_PLACES_API_KEY` (IP geolocation itself needs no key) |

**Always real, regardless of keys**: file upload, PDF/DOCX text extraction, image OCR (Tesseract, runs locally), severity classification (deterministic, not AI), PDF export (Puppeteer), auth (password hashing, JWT sessions, OTP flow), and the ratings database.

## Architecture notes

- The **extracted report is never persisted** — it lives only in the backend's in-memory session store (`backend/src/services/sessionStore/inMemoryStore.ts`), cleared on sign-out, 15-minute idle timeout, or session close. Only accounts and rating/feedback rows are written to the database (see `backend/prisma/schema.prisma` — intentionally small).
- Severity (high/low/borderline/normal) and the range-bar percentages are computed deterministically in `backend/src/services/ai/severityCalculator.ts`, never left to the AI model.
- The chatbot is grounded strictly in the session's extracted values — see the system prompt in `backend/src/services/ai/chatPrompt.ts`.

## Known scope trims

- Scanned/image-only PDFs fall back to whatever sparse text `pdf-parse` finds rather than rendering pages to images for OCR (would need `pdfjs-dist` + a native canvas dependency). JPEG/PNG uploads and photo-based PDFs both go through full OCR.
- No native mobile app — this is a responsive web app per the PRD's own "built for the webapp" scope; the camera-scan screen uses the device camera via the browser on narrow viewports.
