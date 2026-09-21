# Lab Report Explainer

A full-stack application for uploading laboratory reports, understanding medical test values in plain language, and interacting with an AI-powered report assistant.

## Applications

Portal — React + Vite frontend

Engine — Node.js + Express + TypeScript backend

Postgres — PostgreSQL database managed through Prisma ORM

## Architecture

                         LAB REPORT EXPLAINER
                                  |
             ┌────────────────────┴────────────────────┐
             │                                         │
             ▼                                         ▼
       ┌─────────────┐                           ┌─────────────┐
       │   PORTAL    │                           │   ENGINE    │
       │ React + Vite│                           │ Node/Express│
       │             │────── REST API ─────────►│ TypeScript  │
       │ Frontend    │                           │ Backend     │
       └─────────────┘                           └──────┬──────┘
                                                       │
                                                       │ Prisma
                                                       ▼
                                                ┌─────────────┐
                                                │  POSTGRES   │
                                                │ PostgreSQL  │
                                                └─────────────┘

## Project Structure

AI-Lab/
├── frontend/                         # Portal
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── backend/                          # Engine
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20260921170000_init_postgres/
│   │   │       └── migration.sql
│   │   ├── migrations_sqlite_backup/
│   │   ├── migration_lock.toml
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       ├── chat.routes.ts
│   │       ├── reports.routes.ts
│   │       └── rating.routes.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md

## Technology Stack

Layer

Technology

Frontend

React

Build Tool

Vite

Frontend Language

TypeScript

Backend

Node.js

Backend Framework

Express

Backend Language

TypeScript

ORM

Prisma 5.22

Database

PostgreSQL

Authentication

Google Identity Services

Sessions

JWT / Refresh Tokens

Hosting

Railway

AI

Configurable AI provider

Features

Google Sign-In

Email authentication

OTP verification

User accounts

Refresh-token sessions

Laboratory report upload

Report processing

Laboratory value extraction

Report explanations

PDF/report operations

AI assistant chat

Ratings and feedback

PostgreSQL persistence

Railway deployment

Requirements

Node.js 24+

npm

Git

Railway CLI (optional)

Check versions:

node --version
npm --version

Installation

Clone the repository:

git clone <REPOSITORY_URL>
cd AI-Lab

Install Portal dependencies:

cd frontend
npm install

Install Engine dependencies:

cd ../backend
npm install

Environment Configuration

### Portal

Create:

frontend/.env

Example:

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

### Engine

Create:

backend/.env

Example:

DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"

PORT=4000

FRONTEND_ORIGIN="http://localhost:5173"

GOOGLE_OAUTH_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"

JWT_SECRET="YOUR_JWT_SECRET"

REFRESH_TOKEN_SECRET="YOUR_REFRESH_TOKEN_SECRET"

DATA_ENC_KEY="YOUR_DATA_ENCRYPTION_KEY"

MOCK_AI=true

For real AI:

MOCK_AI=false
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
CLAUDE_MODEL="YOUR_MODEL"

Environment Variables

Portal

Variable

Purpose

VITE_GOOGLE_CLIENT_ID

Google Sign-In client ID

Engine

Variable

Purpose

DATABASE_URL

PostgreSQL connection

PORT

Backend port

FRONTEND_ORIGIN

Allowed frontend origin

GOOGLE_OAUTH_CLIENT_ID

Google authentication

JWT_SECRET

JWT/session security

REFRESH_TOKEN_SECRET

Refresh-token security

DATA_ENC_KEY

Data encryption

MOCK_AI

Enable mock AI

ANTHROPIC_API_KEY

AI provider API key

CLAUDE_MODEL

AI model

Local Development

The application runs as two processes:

Portal
http://localhost:5173
      |
      | REST API
      v
Engine
http://localhost:4000
      |
      | Prisma
      v
Railway PostgreSQL

Run Engine

Open Terminal 1:

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

Expected:

Lab Explainer backend listening on 0.0.0.0:4000

Engine:

http://localhost:4000

Run Portal

Open Terminal 2:

cd frontend
npm install
npm run dev

Portal:

http://localhost:5173

Open:

http://localhost:5173

Local Database

Production PostgreSQL is hosted on Railway.

Do not use Railway's private hostname directly from your local machine:

postgres.railway.internal

For local development, use Railway's DATABASE_PUBLIC_URL:

DATABASE_URL="postgresql://postgres:PASSWORD@PUBLIC_HOST:PORT/railway"

Use the exact value generated by Railway.

Railway Tunnel

A temporary PostgreSQL tunnel can also be used:

railway connect postgres --tunnel-only

The tunnel provides a temporary address such as:

127.0.0.1:<TEMPORARY_PORT>

The tunnel must remain running while the local Engine uses it.

For regular local development, DATABASE_PUBLIC_URL is simpler.

Prisma

Current version:

Prisma 5.22.0

Schema:

backend/prisma/schema.prisma

Datasource:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

Generate:

cd backend
npx prisma generate

Check migrations:

npx prisma migrate status

Apply migrations:

npx prisma migrate deploy

Open Prisma Studio:

npx prisma studio

Database Migration

Initial PostgreSQL migration:

backend/prisma/migrations/20260921170000_init_postgres/migration.sql

Migration files must be committed to Git.

Database Models

User

User
├── id
├── email
├── passwordHash
├── googleSub
├── emailVerifiedAt
├── hasSeenWalkthrough
└── createdAt

Relationships:

User
├── OtpCode[]
├── RefreshToken[]
└── Rating[]

OtpCode

OtpCode
├── id
├── userId
├── codeHash
├── expiresAt
├── attempts
├── resendCount
├── lastSentAt
├── consumedAt
└── createdAt

RefreshToken

RefreshToken
├── id
├── userId
├── tokenHash
├── expiresAt
├── revokedAt
└── createdAt

Rating

Rating
├── id
├── userId
├── score
├── comment
├── meta
└── createdAt

Google Sign-In

Portal:

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Engine:

GOOGLE_OAUTH_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Both must correspond to the same Google OAuth Web Client.

Authorized Origins

Local:

http://localhost:5173

Production:

https://portal-production-b3d5.up.railway.app

Authentication Flow

User
 |
 v
Portal
 |
 | Google Identity Services
 v
Google
 |
 | ID Token
 v
Portal
 |
 | POST /api/auth/google
 v
Engine
 |
 | Verify token
 v
Prisma
 |
 v
Postgres
 |
 v
Session

API

Local base URL:

http://localhost:4000

Production base URL:

https://engine-production-5694.up.railway.app

Health

GET /api/health

Local:

http://localhost:4000/api/health

Production:

https://engine-production-5694.up.railway.app/api/health

Expected:

{
  "ok": true
}

Authentication

POST /api/auth/google

Example:

{
  "idToken": "GOOGLE_ID_TOKEN"
}

Successful response:

{
  "ok": true,
  "needsVerify": false,
  "userId": "USER_ID"
}

Other authentication routes:

/api/auth/*

Reports

/api/reports/*

Supports report upload, processing, report data and PDF-related operations.

Chat

POST /api/chat/message

Example:

{
  "message": "What does my hemoglobin result mean?",
  "thread": []
}

Ratings

/api/rating/*

Supports scores, comments, metadata and user association.

AI Assistant

For development:

MOCK_AI=true

For real AI:

MOCK_AI=false
ANTHROPIC_API_KEY="YOUR_API_KEY"
CLAUDE_MODEL="YOUR_MODEL"

Railway Production

Railway contains three services:

Railway
│
├── Portal
│   └── React + Vite
│
├── Engine
│   └── Node + Express
│
└── Postgres
    └── PostgreSQL

Portal

Root:

/frontend

Build:

npm install && npm run build

Start:

npm run start

Production:

https://portal-production-b3d5.up.railway.app

Engine

Root:

/backend

The backend listens on:

0.0.0.0:${PORT}

Production:

https://engine-production-5694.up.railway.app

Engine Production Variables

DATABASE_URL=${{Postgres.DATABASE_URL}}

FRONTEND_ORIGIN=https://portal-production-b3d5.up.railway.app

GOOGLE_OAUTH_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET

REFRESH_TOKEN_SECRET=YOUR_PRODUCTION_REFRESH_TOKEN_SECRET

DATA_ENC_KEY=YOUR_PRODUCTION_DATA_ENCRYPTION_KEY

MOCK_AI=true

Portal Production Variables

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Production Database

Production Engine must use:

DATABASE_URL=${{Postgres.DATABASE_URL}}

Do not replace the production database URL with the local DATABASE_PUBLIC_URL.

Production architecture:

Portal
  |
  | HTTPS
  v
Engine
  |
  | Railway private network
  v
Postgres

Build

Portal

cd frontend
npm install
npm run build

Engine

cd backend
npm install
npm run build

Start

Portal

cd frontend
npm run start

Engine

cd backend
npm start

Production Checklist

[ ] Portal builds
[ ] Engine builds
[ ] Prisma Client generated
[ ] PostgreSQL migration committed
[ ] DATABASE_URL configured
[ ] FRONTEND_ORIGIN configured
[ ] Google OAuth configured
[ ] JWT secrets configured
[ ] Encryption key configured
[ ] AI configuration verified
[ ] Engine binds to 0.0.0.0
[ ] Railway PORT is respected
[ ] /api/health works
[ ] Google Sign-In tested
[ ] Report upload tested
[ ] PDF tested
[ ] Chat tested
[ ] Rating tested

Git Workflow

git status
git diff
git add -A
git commit -m "Update application"
git push origin main

Security

Never commit:

.env
.env.local
.env.production
DATABASE_URL
DATABASE_PUBLIC_URL
PostgreSQL passwords
JWT_SECRET
REFRESH_TOKEN_SECRET
DATA_ENC_KEY
Google secrets
ANTHROPIC_API_KEY
SMTP credentials

Store production secrets in Railway Variables.

If a production credential is exposed, rotate it immediately.

Troubleshooting

PostgreSQL cannot be reached locally

Error:

Can't reach database server at postgres.railway.internal

Use Railway's DATABASE_PUBLIC_URL in:

backend/.env

Example:

DATABASE_URL="postgresql://postgres:PASSWORD@xxxx.proxy.rlwy.net:PORT/railway"

Temporary tunnel cannot be reached

Error:

Can't reach database server at 127.0.0.1:<PORT>

Restart:

railway connect postgres --tunnel-only

or use DATABASE_PUBLIC_URL.

Prisma error

cd backend
npx prisma generate
npm run dev

Migration error

cd backend
npx prisma migrate status
npx prisma migrate deploy

Google OAuth error

Verify:

GOOGLE_OAUTH_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Verify authorized origins:

http://localhost:5173
https://portal-production-b3d5.up.railway.app

CORS error

Local:

FRONTEND_ORIGIN=http://localhost:5173

Production:

FRONTEND_ORIGIN=https://portal-production-b3d5.up.railway.app

Restart Engine after changing variables.

Important Prisma Note

The project previously contained a Prisma 8 ORM scaffold.

The current application uses Prisma 5.22 and the standard Prisma workflow.

Current schema:

backend/prisma/schema.prisma

Current migrations:

backend/prisma/migrations/

Current commands:

npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npx prisma studio

The old Prisma 8 scaffold workflow is no longer required.

Quick Start

After environment variables are configured:

Terminal 1 — Engine

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

Engine:

http://localhost:4000

Terminal 2 — Portal

cd frontend
npm install
npm run dev

Portal:

http://localhost:5173

Open:

http://localhost:5173

Production URLs

Portal:

https://portal-production-b3d5.up.railway.app

Engine:

https://engine-production-5694.up.railway.app

Engine Health:

https://engine-production-5694.up.railway.app/api/health

Privacy:

https://portal-production-b3d5.up.railway.app/privacy

Terms:

https://portal-production-b3d5.up.railway.app/terms

Full Application Flow

                    USER
                      |
                      v
             ┌─────────────────┐
             │     PORTAL      │
             │ React + Vite    │
             └────────┬────────┘
                      |
                      | Authentication
                      | Reports
                      | Chat
                      | Ratings
                      v
             ┌─────────────────┐
             │     ENGINE      │
             │ Node + Express  │
             └────────┬────────┘
                      |
            ┌─────────┴─────────┐
            |                   |
            v                   v
     ┌─────────────┐     ┌─────────────┐
     │   PRISMA    │     │ AI PROVIDER │
     │    5.22     │     │             │
     └──────┬──────┘     └─────────────┘
            |
            v
     ┌─────────────┐
     │  POSTGRES   │
     │   Railway   │
     └─────────────┘

License

Private project.

All rights reserved.