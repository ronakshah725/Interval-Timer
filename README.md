# Interval Timer

A personal interview timer: build multi-block timers (e.g. "System Design 35"),
run them with per-block progress, and save/reuse configurations.

**Stack:** TanStack Start (React 19, file-based routing, server functions) ·
Tailwind CSS v4 · Prisma 7 · Neon Postgres (serverless HTTP driver) ·
deployed to Cloudflare Workers.

This is a port of the previous Next.js app — same UI and features, no
Vercel/Next.js runtime dependency.

## Develop

```bash
pnpm install
pnpm dev        # vite dev server (Cloudflare runtime emulated)
```

## Build

```bash
pnpm build      # prisma generate --no-engine && vite build
pnpm typecheck  # tsc --noEmit
```

## Deploy to Cloudflare Workers

Prerequisites: a Cloudflare account.

1. Authenticate wrangler (this is the credential step — it opens a browser
   OAuth flow, or set a `CLOUDFLARE_API_TOKEN` env var instead):
   ```bash
   npx wrangler login
   ```
2. Store the database URL as a Worker secret (never commit it):
   ```bash
   npx wrangler secret put POSTGRES_PRISMA_URL
   ```
   Use the Neon **pooled** connection string (the same `POSTGRES_PRISMA_URL`
   value). No database migration is needed — the schema already exists.
3. Build and deploy:
   ```bash
   pnpm build
   npx wrangler deploy
   ```

`wrangler.jsonc` already points at TanStack Start's Worker entry
(`@tanstack/react-start/server-entry`) with `nodejs_compat` enabled.

## Notes

- The DB client (`src/lib/db.ts`) uses `@prisma/adapter-neon`, the Neon
  serverless HTTP driver — required because Workers have no TCP sockets and
  can't run Prisma's Node engine. The Postgres schema is unchanged.
- Server functions read `POSTGRES_PRISMA_URL` lazily per request: Cloudflare
  injects Worker env at request time, so module-scope reads would be
  `undefined` on the edge.
