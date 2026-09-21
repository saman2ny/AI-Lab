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

## Deploying to Railway

### Backend service

1. Create a new Railway project and add a Node service for the backend folder.
2. Set these environment variables in Railway:

```bash
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN=https://your-frontend.up.railway.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=replace-me
REFRESH_TOKEN_SECRET=replace-me
DATA_ENC_KEY=replace-me-32-bytes
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Lab Explainer <no-reply@gmail.com>"
MOCK_AI=false
```

3. Build command: `npm install && npm run build`
4. Start command: `npm run prisma:deploy && npm run start`
5. If you keep SQLite locally, do not deploy the app with the default SQLite URL; Railway's filesystem is not persistent. Use Postgres for production.

### Frontend service

1. Create a second Railway service for the frontend folder.
2. Set the frontend build env var:

```bash
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

3. Build command: `npm install && npm run build`
4. Start command: `npm run start`

This keeps the frontend and backend separate while still allowing the browser to talk to the API using a real backend URL.

## SMTP / email verification notes

- For Gmail, use a 16-character app password instead of your normal password.
- Set `SMTP_SECURE=true` when using port `465`.
- Leave `SMTP_SECURE=false` with port `587` for the usual STARTTLS flow.
- If SMTP is not configured, the backend logs the OTP to the console and still keeps the app demoable in dev.


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
