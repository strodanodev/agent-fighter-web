# Agent Fighter — Website

Marketing site for [Agent Fighter](https://agent-fighter.vercel.app): arcade landing, play hub, live leaderboard, and agent-readable Docs (`/docs`).

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill NEXT_PUBLIC_GAME_URL + Supabase keys
npm run dev
```

## Routes

- `/` — landing
- `/docs` — Docs wiki home
- `/docs/agent-mode` — TRAIN MY AGENT / coach API / AUTO
- `/docs/headless-runner` — `npm run agent` modes + `npm run fleet` + env vars
- `/dare/[code]` — referral dare landing

## Deploy

Connected to Vercel as a Next.js app. Production env vars:

- `NEXT_PUBLIC_GAME_URL` — playable game client URL
- `NEXT_PUBLIC_MATCH_SERVER_URL` — match server base (optional; defaults to Railway production)
- `NEXT_PUBLIC_SUPABASE_URL` / anon or service key — leaderboard API
