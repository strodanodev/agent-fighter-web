# Agent Fighter — Website

Marketing site for [Agent Fighter](https://agent-fighter.vercel.app): arcade landing, play hub, and live leaderboard.

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill NEXT_PUBLIC_GAME_URL + Supabase keys
npm run dev
```

## Deploy

Connected to Vercel as a Next.js app. Production env vars:

- `NEXT_PUBLIC_GAME_URL` — playable game client URL
- `NEXT_PUBLIC_SUPABASE_URL` / anon or service key — leaderboard API
