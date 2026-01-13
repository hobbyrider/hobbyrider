# Copilot / AI agent instructions for ph-clone ✅

This file contains concise, actionable guidance for AI coding agents to be immediately productive in this repository.

## Big picture
- This is a small Next.js (App Router) TypeScript app using the `app/` directory. Major files:
  - `app/page.tsx` — homepage (client component: shows local software list, upvotes implemented in client state)
  - `app/submit/page.tsx` — submission form (client component; pushes submission via URL query params)
  - Styling uses Tailwind via `postcss.config.mjs` and `app/globals.css`.
- DB layer: Prisma (v7+) with `prisma` folder: `schema.prisma`, `migrations/` and `prisma.config.ts`.
- Runtime deps: Next 16, React 19, TypeScript. Linting via ESLint (`npm run lint`).

## Useful commands 🧰
- Run dev server: `npm run dev`
- Build: `npm run build`; Start production: `npm run start`
- Lint: `npm run lint` (runs `eslint`)
- Prisma (after fixing datasource—see below):
  - `npx prisma db push` — push schema to DB
  - `npx prisma migrate dev` — create & apply migrations
  - `npx prisma db pull` — introspect an existing DB
- When changing deps: run `npm install` and commit `package-lock.json`.

## Project-specific conventions & patterns 🔧
- App Router + "use client": any file that imports hooks like `useState`, `useRouter`, or `useSearchParams` must include the top-level string `"use client"` (see `app/page.tsx` and `app/submit/page.tsx`).
- The submit flow is intentionally client-only: submissions are encoded into query parameters and the home page reads them via `useSearchParams`. There are currently no server endpoints or persistence for submissions.
- Upvotes are stored in local React state only (no backend). If you add server persistence, update both the UI and the submission/upvote flow accordingly.
- CSS/Tailwind classes are used widely—prefer utility classes for small components.

## Prisma & DB notes (critical) ⚠️
- Prisma is configured via `prisma.config.ts` (it loads `process.env.DATABASE_URL`).
- **Important:** Prisma v7 requires connection URLs to be provided via the config file (or client constructor), not inline in `schema.prisma`.
  - Current problematic block in `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
  - Fix: remove the `url` line from `schema.prisma` so it becomes:
    ```prisma
    datasource db {
      provider = "postgresql"
    }
    ```
  - Ensure `prisma.config.ts` has `datasource: { url: process.env["DATABASE_URL"] }` (already present), and that `.env` has `DATABASE_URL` and is ignored by git (`.gitignore` contains `.env`).
- After the fix, run `npx prisma db push` or `npx prisma migrate dev`.

## Integration & external dependencies 🔗
- No external APIs or serverless functions are configured by default—behavior is client-side.
- Adding a server or API route should follow Next.js conventions (`/app/api` or `pages/api` for pages router compatibility) and consume Prisma via `@prisma/client`.

## Where to look for changes or patterns
- `app/` — UI & routing patterns
- `prisma/schema.prisma` and `prisma.config.ts` — DB model & config
- `package.json` — scripts and dependency versions
- `postcss.config.mjs`, `tailwind` — styling setup

## Troubleshooting tips & examples
- Fixing Prisma P1012: remove `url = env("DATABASE_URL")` from the schema and ensure `prisma.config.ts` uses `process.env["DATABASE_URL"]`, then re-run `npx prisma db push`.
- If you intend to persist submissions, create a server API route and store items in the DB (add migrations when altering Prisma models).

---
If any of the above is unclear or you'd like me to expand any section (e.g., add example API endpoints, or a PR template to enforce patterns), say which part you want expanded and I'll iterate. ✍️
