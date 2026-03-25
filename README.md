# Ripple 🌊

A social giving network — think Venmo for donating and volunteering. Where good people come to do good things together.

## Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node + Express + TypeScript
- **Database**: PostgreSQL via Prisma
- **Auth**: Google OAuth (passport.js)
- **Queue**: BullMQ + Redis
- **Monorepo**: npm workspaces (`/frontend`, `/api`, `/shared`, `/workers`)

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Redis running locally
- Google OAuth credentials (for auth)

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd Ripple
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `GOOGLE_CLIENT_ID` — from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `SESSION_SECRET` — any random string

### 3. Set up the database

Create the database:
```bash
psql postgres -c "CREATE DATABASE ripple;"
```

Run migrations:
```bash
npm run db:migrate
```

Seed with demo data:
```bash
npm run db:seed
```

### 4. Start development servers

```bash
npm run dev
```

This starts:
- API at http://localhost:3001
- Frontend at http://localhost:5173

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity"
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URI to: `http://localhost:3001/auth/google/callback`
6. Copy Client ID and Secret to your `.env`

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API + Frontend concurrently |
| `npm run dev:api` | Start API only |
| `npm run dev:frontend` | Start frontend only |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed with demo data (15 orgs, 3 users, 10 actions) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build` | Build all packages |

## Project Structure

```
Ripple/
├── api/               # Express API
│   ├── src/
│   │   ├── routes/    # auth, feed, orgs, actions, ripples, users
│   │   ├── lib/       # prisma, redis
│   │   └── middleware/
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── frontend/          # React app
│   └── src/
│       ├── components/  # Layout, FeedCard, OrgCard, ActionModal, etc.
│       ├── pages/       # Feed, Discover, Org, Ripple, Profile
│       ├── context/     # AuthContext
│       └── lib/         # api client, utils
├── shared/            # Shared TypeScript types
├── workers/           # BullMQ workers (streak updates, weekly reset)
└── .env               # Environment variables
```

## Demo Data

After seeding, you'll have:
- 15 real organizations across all 7 categories
- 3 demo users: Sarah Chen, Marcus Williams, Priya Patel
- 10 actions with comments and reactions
- 2 active ripples

## Key Features

- **Feed** — Everyone/Following tabs with real-time-feel updates
- **+ Action modal** — 6-step flow: org → type → amount → comment → privacy → confirm
- **Org pages** — Cover image, trust signals, activity/ripples/about tabs
- **Ripples** — Viral chain giving with progress bars and participant chains
- **Profiles** — Streaks, stats, causes grid, privacy toggle
- **Google OAuth** — Sign in modal that preserves page context
