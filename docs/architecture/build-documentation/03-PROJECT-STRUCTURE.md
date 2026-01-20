# PART 3 — Project Structure and "Mental Model"

**Previous:** [Tech Stack ←](02-TECH-STACK.md) | **Next:** [Data Model →](04-DATA-MODEL.md)

## Repository Tree View

```
ph-clone/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Route group (layout wrapper)
│   │   ├── layout.tsx           # Main layout (header, footer)
│   │   ├── page.tsx             # Homepage
│   │   ├── product/[id]/        # Product detail pages
│   │   ├── submit/              # Product submission page
│   │   ├── search/              # Search results page
│   │   ├── user/[id]/           # User profile pages
│   │   └── builder/[username]/  # Legacy route (redirects to /user/[id])
│   ├── actions/                  # Server Actions (9 files)
│   │   ├── software.ts          # Product CRUD operations
│   │   ├── comments.ts          # Comment operations
│   │   ├── auth.ts              # Authentication actions
│   │   ├── categories.ts        # Category management
│   │   ├── search.ts            # Search functionality
│   │   ├── moderation.ts        # Moderation system
│   │   ├── analytics.ts         # View tracking, analytics
│   │   ├── user.ts              # User profile operations
│   │   └── follow.ts            # Follow/unfollow users
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── upload/              # File upload endpoint
│   │   ├── create-product/      # Product creation API
│   │   └── dev/                 # Dev utilities (db-sync, etc.)
│   ├── components/               # React Components (20+ files)
│   │   ├── feed-item-card.tsx   # Product card component
│   │   ├── upvote-button.tsx    # Upvote button
│   │   ├── site-header.tsx      # Navigation header
│   │   ├── site-footer.tsx      # Footer
│   │   ├── search-modal.tsx    # Search modal
│   │   ├── in-app-browser-gate.tsx # In-app browser detection
│   │   └── icons/               # Icon components
│   ├── admin/                    # Admin pages
│   │   └── moderation/          # Moderation panel
│   ├── layout.tsx                # Root layout (html, body)
│   ├── globals.css               # Global styles + Tailwind
│   ├── robots.ts                 # robots.txt generation
│   └── sitemap.ts                # sitemap.xml generation
├── lib/                          # Shared utilities
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # NextAuth configuration
│   ├── utils.ts                 # General utilities
│   ├── filters.ts               # Filtering/sorting logic
│   ├── rate-limit.ts            # Rate limiting
│   ├── cache.ts                 # React cache utilities (unused)
│   ├── email.ts                 # Email sending (Resend)
│   ├── email-template.ts        # Email templates
│   ├── design-system.ts         # Design tokens (reference)
│   ├── inAppBrowser.ts          # In-app browser detection
│   └── get-session.ts           # Session helper
├── components/                   # shadcn/ui components
│   └── ui/                      # Reusable UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
├── prisma/
│   └── schema.prisma            # Database schema (203 lines)
├── types/
│   └── next-auth.d.ts           # NextAuth type extensions
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   ├── set-admin.ts             # Make user admin
│   └── migrate-*.ts             # Image migration scripts
├── docs/                         # Documentation
│   └── build-documentation/      # Build documentation (this folder)
└── [config files]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    └── prisma.config.ts
```

## Folder Purpose Guide

### `app/` - Next.js App Router

**What it contains:** All pages, routes, Server Actions, and API routes.

**Why it exists:** Next.js App Router convention. File structure determines URL structure.

**Key conventions:**
- `page.tsx` = Route endpoint
- `layout.tsx` = Shared layout wrapper
- `(group)/` = Route group (doesn't affect URL)
- `[id]/` = Dynamic route parameter
- Files without `"use client"` = Server Components (default)

### `app/actions/` - Server Actions

**What it contains:** Server-side functions that can be called from Client Components.

**Why it exists:** Next.js pattern for server-side mutations. Replaces API routes for form handling.

**Example pattern:**
```typescript
// app/actions/software.ts
"use server"
export async function createSoftware(formData: FormData) {
  // Server-side code here
}
```

### `app/components/` - React Components

**What it contains:** Reusable React components (both client and server).

**Why it exists:** Shared UI components used across pages.

**Convention:** Components starting with `"use client"` can use React hooks.

### `lib/` - Shared Libraries

**What it contains:** Utility functions, database client, auth config.

**Why it exists:** Shared code not tied to routes or components.

**Key files:**
- `lib/prisma.ts` - Database client (singleton)
- `lib/auth.ts` - NextAuth configuration
- `lib/utils.ts` - General utilities (sanitization, time formatting)
- `lib/inAppBrowser.ts` - In-app browser detection utility

### `prisma/` - Database Schema

**What it contains:** Prisma schema definition.

**Why it exists:** Database schema as code. Single source of truth.

### `components/ui/` - shadcn/ui Components

**What it contains:** Reusable UI primitives (button, card, dialog).

**Why it exists:** shadcn/ui pattern. Copy-paste components (not npm package).

## "Where Do I Change X?" Cheat Sheet

### UI Layout & Navigation
- **Site header:** `app/components/site-header.tsx`
- **Site footer:** `app/components/site-footer.tsx`
- **Main layout:** `app/(main)/layout.tsx`
- **Root layout (html/body):** `app/layout.tsx`
- **Global styles:** `app/globals.css`

### Product-Related UI
- **Product card:** `app/components/feed-item-card.tsx`
- **Product detail page:** `app/(main)/product/[id]/page.tsx`
- **Product submission form:** `app/(main)/submit/page.tsx`
- **Product gallery:** `app/components/product-gallery.tsx`
- **Upvote button:** `app/components/upvote-button.tsx`

### Forms
- **Product submission:** `app/(main)/submit/page.tsx` (form) + `app/actions/software.ts` (handler)
- **Comment form:** `app/(main)/product/[id]/comment-form.tsx`
- **User profile edit:** `app/(main)/user/[id]/edit/edit-form.tsx`

### Database Schema
- **Schema definition:** `prisma/schema.prisma`
- **Migrations:** Run `npx prisma db push` (no migrations folder currently)
- **Prisma Client generation:** `prisma generate` (runs on `postinstall`)

### API Endpoints
- **NextAuth routes:** `app/api/auth/[...nextauth]/route.ts`
- **File upload:** `app/api/upload/route.ts`
- **Product creation API:** `app/api/create-product/route.ts`

### Server-Side Logic
- **Product operations:** `app/actions/software.ts`
  - `createSoftware()` - Create product
  - `upvoteSoftware()` - Toggle upvote
  - `updateSoftware()` - Update product
  - `deleteSoftware()` - Delete product
- **Comments:** `app/actions/comments.ts`
  - `createComment()` - Add comment
  - `updateComment()` - Edit comment
  - `deleteComment()` - Delete comment
- **Search:** `app/actions/search.ts`
  - `searchSoftware()` - Search products

### Seeding / Fixtures
- **Category seeding:** `app/api/seed-categories/route.ts` (API endpoint)
- **Admin user creation:** `scripts/set-admin.ts` (TypeScript script)

### Environment Variables
- **Local:** `.env.local` (not in repo, in `.gitignore`)
- **Production:** Vercel Dashboard → Project Settings → Environment Variables

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT signing secret
- `NEXTAUTH_URL` - Production URL (`https://hobbyrider.vercel.app`)

**Optional env vars:**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Magic link emails
- `BLOB_READ_WRITE_TOKEN` - File uploads (auto-provided on Vercel)

### Logging / Analytics
**Current state:** Minimal logging using `console.error()`.

**Locations:**
- `app/actions/analytics.ts` - View tracking (silent failures)
- Various `app/actions/*.ts` - `console.error()` for errors

**No external logging service found** (Sentry, LogRocket, etc.).

---

**Previous:** [Tech Stack ←](02-TECH-STACK.md) | **Next:** [Data Model →](04-DATA-MODEL.md)
