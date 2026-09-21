# Lab Report Explainer — Implementation Plan

> **Status: built and verified end-to-end** (2026-09-14). This file is the plan as approved, with one correction below (database) to match what was actually deployed, since no Docker/Postgres was available on this machine.

## Context

The PRD ("AI Lab report explainer") describes a consumer webapp: a patient uploads a lab report (PDF/Word/photo), AI explains every value in plain English, colour+shape-codes severity (RED/YELLOW/GREEN), suggests lifestyle actions, and offers a chatbot for follow-up questions including a "find a doctor near me" referral. This is a **greenfield build** — no existing code.

Critically, a prior design session already produced a **complete hi-fi design handoff** (found in `Deliverable and platform selection.zip` on the user's Desktop): exact colour/type/spacing tokens, all 11 screens fully specced (layout, copy, components, states), a navigation graph, and a state model. That design doc is the primary UI/UX source of truth and takes precedence over re-deriving screens from scratch. It also explicitly flagged some gaps (failure states, idle timeout, sign-out confirmation, large panels) that this plan resolves, and made one deliberate deviation from the PRD (dropping voice input) that the user has confirmed keeping.

A real sample lab report (`report.jpg`, a 10-page phone photo of an actual Indian diagnostics panel) and a sample PDF output (`lab-explainer-report.pdf`, confirmed to be the literal target visual spec for "Save as PDF") are also on the Desktop and will serve as test fixtures.

**Decisions locked in with the user before planning:**
1. Chatbot is **text-only** — no voice input (per the design's explicit cut, overriding the PRD).
2. Doctor referral uses **IP-based geolocation** (per literal PRD wording), not browser geolocation.
3. **Responsive web app only** — no separate native/React Native app.
4. Report content is **never persisted server-side** — session/memory only, cleared on sign-out / 15-min idle / session close. Only accounts and rating/feedback rows persist in the DB.
5. **Google sign-ins skip the OTP verification screen** (Google already verifies the email); email/password sign-ups still go through it.

## Project location

New project at `C:\Users\Arun Prasad\Desktop\lab-report-explainer\`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript, React Router v6, Zustand | Matches the design's token-driven CSS approach; each design screen becomes a real route; Zustand gives typed state slices without Redux boilerplate. |
| Backend | Node.js + Express + TypeScript | The "report lives only in server memory, cleared on idle/sign-out" requirement needs one long-lived process holding an in-memory session map with a TTL sweep — serverless/Next API routes don't preserve that without adding Redis, which defeats the point. |
| Database | **SQLite** + Prisma ORM (as built — see note) | Only accounts + ratings persist — relational constraints (unique email, FK ratings→users) fit better than schemaless Mongo. *Originally planned as Postgres + Docker Compose for role-based GRANTs and `pgcrypto`; no Docker or Postgres was available on this machine, so local dev uses a zero-install SQLite file (`backend/prisma/dev.db`) instead. The schema avoids Postgres-only features, so pointing `DATABASE_URL` at a real Postgres instance for production is a config change, not a rewrite. Row-level access control and `pgcrypto` remain a production-environment follow-up.* |

### Screen → route mapping (from the design doc's screen list)
`landing→/`, `scan→/scan` (mobile-viewport only), `auth→/auth`, `verify→/verify`, `analyzing→/analysing`, `walk→/walkthrough`, `summary→/summary`, `list→/values`, `detail→/values/:key`, `chat→/chat`, `rating→/rating`.

State slices (Zustand): `authStore`, `reportStore` (values[], extractionStatus, hasSeenWalkthrough), `chatStore` (thread, busy, pending pre-sent question), `uiStore` (toast, idle-warning modal, filter).

## Design system

Recreate faithfully from the design README: colours (`#0f6e63` accent, `#f7f5f1` background, ink/muted-ink scale), Plus Jakarta Sans (UI) + IBM Plex Mono (numerics/ranges, self-hosted), spacing/radius/motion values, and the **severity shape+colour encoding** (diamond=above/below range, square=borderline, circle=in-range) — this ships **always on**, not a toggle, since it's the colour-blindness accessibility requirement (PRD section 8), not decorative. Ignore the prototype's `.dc.html` format itself and its review-harness chrome (top bar, phone bezel) — those are not app UI.

## Auth

- Email+password: `bcryptjs` hashing, register/login endpoints.
- Google OAuth2: Google Identity Services button → ID token → backend verifies via `google-auth-library` → upsert user by verified email → **skips OTP**, goes straight to analysing.
- Email/password signups: 6-digit OTP (hashed at rest, 10-min expiry, 5 max attempts, 60s resend cooldown) via a swappable `emailService` — real SMTP via `nodemailer`, dev fallback logs the code to console (optionally echoed in the API response behind `DEV_EXPOSE_OTP`, since no real SMTP credentials are available).
- Sessions: short-lived JWT (15 min, matching idle timeout) + rotated httpOnly refresh cookie.
- **Idle timeout (resolves a design-flagged gap)**: frontend timer warns at 13 min ("cleared in 2 minutes — stay signed in?"); backend independently sweeps its in-memory session map every 60s to evict idle sessions, so the clearing promise holds even if the tab is killed.
- **Sign-out confirmation (resolves a design-flagged gap)**: an in-app modal, not `window.confirm`.

## Upload & extraction pipeline

`POST /api/reports/upload` (multer, 20MB limit, mimetype+magic-byte check, multi-file for multi-page photo uploads like the sample fixture).

- PDF text layer → `pdf-parse`; scanned/image-only PDF → `pdfjs-dist` render → OCR fallback.
- DOCX → `mammoth`.
- JPEG/PNG → `sharp` preprocess (deskew/contrast) → `tesseract.js` (swappable via `OCR_PROVIDER` env var for a cloud OCR later).
- Raw text → structured values via a forced-JSON Claude tool-use call (regex is unreliable across report layouts, as the two sample documents' different table structures show): `{reportDate, reportLabel, values: [{name, rawValue, unit, refRangeRaw, category}], extractionConfidence, unrecognizedText}`.

**Failure states (resolves design-flagged gaps):** unreadable/unsupported file → inline dropzone error before upload; zero values recognized → empty-state variant of the Summary screen; partial extraction → dismissible banner with match count; 20+ values → group the All Values list by `category` (mirroring real report sections like "HAEMATOLOGY / DIFFERENTIAL COUNTS") instead of a flat list.

## AI explanation generation

Severity is **never decided by the model** — a deterministic `severityCalculator.ts` parses the reference range (bounded or open-ended like "Below 100"), classifies `high/low/borderline/normal`, and computes the range-bar `marker/bandA/bandB` percentages. Walkthrough priority order (top 4: out-of-range first, then borderline) is also computed server-side, not left to the model. Explanation text (`plain`, `meaning`, `helps[]`) comes from one batched Claude call per report, matching the design's value data shape exactly, with a system prompt encoding the documented voice (plain clinical, second person, no hedging, always ends in an action, never diagnoses).

## Chatbot

Real Claude Messages API call grounded in the session's extracted values (small enough to serialize in full each turn); system prompt constrains it to the report only, no diagnosis, defers to clinicians. "Ask the assistant about this `<value>`" from the detail screen auto-sends a pre-filled question on navigating to `/chat`, per the design's documented interaction. Text-only, no mic.

## Doctor lookup

IP-based geolocation (`ip-api.com`, no key needed; swappable via `IPGEO_PROVIDER`; `DEV_FALLBACK_LOCATION` for localhost) feeding Google Places Nearby Search (`GOOGLE_PLACES_API_KEY`). Both a Claude tool and a deterministic shortcut for the exact "Find a doctor near me" suggestion chip. Degrades gracefully to a "can't look this up right now" reply if the Places key is unset.

## PDF export

Puppeteer renders a server-side HTML/CSS template (Handlebars) reusing the app's own design tokens and self-hosted fonts, matching `lab-explainer-report.pdf` closely rather than hand-drawing with `pdfkit`. `GET /api/reports/:sessionId/pdf` → frontend triggers a device download/share, confirms with the "Saved to your device · report still in session" toast.

## Database schema (Prisma)

`User` (email, passwordHash?, googleSub?, emailVerifiedAt, hasSeenWalkthrough), `OtpCode` (hashed code, expiry, attempts, resend tracking), `RefreshToken` (hashed, revocable), `Rating` (score, comment — app-level AES-256-GCM encrypted, meta JSONB, createdAt). **No report-content table exists at all** — non-persistence is architectural, not policy. Two DB roles: `app_user` (the running app's own limited CRUD credential) and `app_admin` (read-only, offline console only).

## What needs real credentials (unavailable to me) — all env-var driven with graceful fallback

| Credential | Fallback when unset |
|---|---|
| `ANTHROPIC_API_KEY` | `MOCK_AI=true` uses the design doc's own sample 11-value dataset — keeps the whole app demoable with zero AI cost; this is what milestone M1 builds against |
| `GOOGLE_OAUTH_CLIENT_ID/SECRET` | Google button hidden/disabled; email+password always works |
| SMTP vars | dev-console-log OTP, optional `DEV_EXPOSE_OTP` |
| `GOOGLE_PLACES_API_KEY` | graceful degraded chat reply |
| `JWT_SECRET`/`DATA_ENC_KEY` | generated locally, not third-party |

Both `frontend/.env.example` and `backend/.env.example` document every variable. The user will need to supply real keys for full functionality; every integration point is built behind these interfaces so it's a config change, not a code change, once keys are available.

## File structure

```
lab-report-explainer/
  docker-compose.yml
  frontend/src/
    state/ (authStore, reportStore, chatStore, uiStore).ts
    screens/ (Landing, Scan, Auth, Verify, Analysing, Walkthrough, Summary, AllValues, ValueDetail, Assistant, Rating).tsx
    components/ (SeverityTag, RangeBar, ValueCard, TopBar, Toast, ProgressDots, FilterChips, IdleWarningModal, SignOutConfirmModal).tsx
    lib/ (api.ts, idleTimer.ts, severity.ts)
    styles/tokens.css, assets/fonts/
  backend/src/
    routes/ (auth, upload, report, chat, doctor, pdf, rating).routes.ts
    services/
      auth/ (passwordService, jwtService, googleOAuth, emailService, otpService).ts
      extraction/ (pdfParser, docxParser, ocrProvider, textNormalizer).ts
      ai/ (claudeClient, extractValuesPrompt, explainValuesPrompt, severityCalculator, chatPrompt).ts
      doctor/ (ipGeoService, placesService).ts
      pdfExport/ (pdfGenerator.ts, templates/report.html)
      sessionStore/inMemoryStore.ts   ← enforces non-persistence, in-memory Map + TTL sweep
    prisma/schema.prisma
```

## Build order

- **M0** — repo scaffold, database (SQLite via Prisma, as built — see Tech stack note above), env files, lint/format.
- **M1** — design system + all 11 screens wired to React Router + Zustand against the mock/sample dataset (`MOCK_AI=true`), full click-through navigation, no backend logic. Validates visual fidelity against the design README before real logic exists.
- **M2** — auth (register/login/Google/verify/resend, JWT+refresh, idle-timeout warning, sign-out confirm).
- **M3** — upload + extraction pipeline, in-memory session store, failure states.
- **M4** — severity calculator + AI explanations wiring walkthrough/summary/list/detail to real data.
- **M5** — chatbot + pre-sent-question flow.
- **M6** — PDF export + doctor lookup.
- **M7** — ratings/DB, encryption/role grants, accessibility pass, large-panel grouping, empty-state screen.

## Critical files

- `backend/src/services/ai/severityCalculator.ts` — deterministic status/band logic everything else depends on.
- `backend/src/services/sessionStore/inMemoryStore.ts` — enforces the core non-persistence requirement.
- `backend/src/services/extraction/textNormalizer.ts` — PDF/DOCX/OCR → Claude extraction bridge.
- `frontend/src/state/reportStore.ts` — single source of truth driving Walkthrough/Summary/List/Detail.
- `backend/prisma/schema.prisma` — the entire persisted surface area, intentionally small.

## Verification plan

Run `npx prisma migrate dev` once, then backend (`npm run dev`, port 4000) and frontend (Vite, port 5173, `/api` proxied) via the Browser pane (`preview_start`). Walk every screen against the design README's token values. Test the upload pipeline against three real fixtures: the multi-page `report.jpg` (OCR path), a generated text-layer PDF, and a trivial DOCX. Verify severity coding against the sample PDF's known values (e.g. Haemoglobin 13.2 gm/dL in range 13–17 → borderline-low per the calculator's threshold). Exercise chat with a grounded question, an out-of-scope diagnostic question (expect deferral), and "Find a doctor near me". Diff the PDF export visually against `lab-explainer-report.pdf`. Force a short `IDLE_TIMEOUT_MS` to confirm both the warning modal and true server-side session eviction. Do a keyboard-only pass and use `read_page` to confirm severity tags expose shape+text, not colour alone.

### Verification actually performed (2026-09-14)

All of the above ran successfully, including a full round-trip through the real `report.jpg` fixture (real OCR, real severity classification, real PDF export matching `lab-explainer-report.pdf`'s layout), full auth (register → OTP verify → session restore on refresh), chat (grounded reply + graceful "Find a doctor" degradation since no Places key is configured), and a rating write with the comment field confirmed encrypted at rest. One real bug was found and fixed during verification: the frontend's offline-dev mock fallback was originally catching genuine HTTP error responses (not just network failures) and silently replacing them with fake success data — fixed so only true network-level failures fall back to mock behavior.
