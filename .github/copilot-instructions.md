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
- **Mobile Responsiveness**: All new features must be mobile-responsive from the start. Use Tailwind responsive breakpoints (`sm:`, `lg:`) following the patterns established in the codebase. Test on mobile viewport (320px-640px).

## Responsiveness Regression Checklist ✅

**Before merging any UI changes, validate at these widths:**
- `320px` (smallest mobile)
- `375px` (standard mobile)
- `768px` (tablet)
- `1024px` (desktop)
- `1280px` (large desktop)

**Must-have checks (all widths):**

1. **No horizontal scroll** — Page content never causes horizontal overflow, even with long URLs or text.
2. **Header never wraps** — Logo + Search icon + Menu icon stay on one row (mobile uses icons only).
3. **Filter chips scroll on mobile** — Sort/date filter buttons scroll horizontally on mobile (`overflow-x-auto` with hidden scrollbar), wrap on `sm+`.
4. **Cards never overflow** — Product cards, category cards, and other list items:
   - Never exceed container width
   - Long titles truncate with `truncate` or wrap gracefully
   - Internal content uses `min-w-0` and `flex-shrink` appropriately
5. **Product detail page layout** — Switches to 2-column (`lg:grid-cols-[1fr_320px]`) only at `lg` breakpoint (1024px+). Single column on mobile/tablet.
6. **Forms full width on mobile** — All inputs/buttons span full width on mobile; forms use `max-w-md`/`max-w-xl` on desktop within global container.
7. **Consistent container spacing** — All pages use `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10`.
8. **Footer grid** — Stacks on mobile, becomes `md:grid-cols-4` on desktop (no overflow).
9. **Badges wrap gracefully** — Category badges and tags wrap with `flex-wrap` when needed, never force horizontal scroll.
10. **Action buttons stay on one line** — Upvote/comment/share buttons use `whitespace-nowrap` or scroll horizontally without breaking layout.

**Quick test command:**
```bash
npm run build  # Must pass before merging
# Then manually test key routes at 320px, 375px, 768px, 1024px widths
```

## Prisma & DB notes (critical) ⚠️
- Prisma is configured via `prisma.config.ts` (it loads `process.env.DATABASE_URL`).
- **Important:** Prisma v7 requires connection URLs to be provided via the config file (or client constructor), not inline in `schema.prisma`.
  - Current problematic block in `prisma/schema.prisma`:
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    