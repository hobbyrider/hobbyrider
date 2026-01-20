# PART 1 — Executive Overview

**Version:** 1.0  
**Last Updated:** Current analysis based on repository inspection  
**Target Audience:** founder

---

## Files Inspected (Repository Analysis)

**Configuration Files:**
- `package.json` - Dependencies, scripts, project metadata
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `next.config.ts` - Next.js configuration (image optimization, Turbopack)
- `prisma/schema.prisma` - Database schema (203 lines, 11 models)
- `prisma.config.ts` - Prisma connection configuration
- `eslint.config.mjs` - Linting rules (Next.js + TypeScript)

**Core Infrastructure:**
- `lib/prisma.ts` - Database client singleton with connection pooling
- `lib/auth.ts` - NextAuth v5 configuration (3 auth providers)
- `lib/utils.ts` - Utility functions (sanitization, time formatting)
- `lib/filters.ts` - Filtering and sorting logic
- `lib/rate-limit.ts` - Rate limiting implementation
- `lib/cache.ts` - React cache utilities (defined but not widely used)

**Key Application Files:**
- `app/(main)/page.tsx` - Homepage with pagination and filtering
- `app/actions/` - Server Actions (9 files: software, comments, auth, categories, etc.)
- `app/api/` - API Routes (upload, auth, dev utilities)
- `app/components/` - React components (20+ files)

**Documentation Files:**
- `ROADMAP.md` - Feature roadmap
- `LAUNCH_READINESS.md` - Launch status
- `DEPLOYMENT.md` - Deployment guide

**Key Findings:**
- Next.js 16.1.1 with App Router
- React 19.2.3 (latest)
- Prisma 7.2.0 with PostgreSQL
- NextAuth v5 (beta.30) with 3 providers
- Tailwind CSS v4
- TypeScript with strict mode
- **No test files found**
- **No CI/CD workflows found**
- Rate limiting implemented
- Input sanitization implemented
- Moderation system implemented

---

## What Hobbyrider Is

Hobbyrider is a community-driven platform similar to Product Hunt where users discover, submit, and upvote software products. Users can submit products with descriptions, screenshots, and categories; other users upvote products, comment, and follow makers. The platform includes search, filtering, moderation, and user profiles.

## High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│           Next.js App Router (Vercel)           │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │   UI     │  │  Server  │  │    API      │  │
│  │ (React)  │  │ Actions  │  │  Routes     │  │
│  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
└───────┼─────────────┼───────────────┼─────────┘
        │             │               │
        ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│        Prisma ORM + PostgreSQL                  │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Products │  │  Users   │  │  Comments   │  │
│  │ Upvotes  │  │ Sessions │  │ Categories  │  │
│  │ Reports  │  │ Follows  │  │  Images     │  │
│  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│            External Services                    │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Vercel   │  │  Resend  │  │   Google    │  │
│  │  Blob    │  │ (Emails) │  │   OAuth     │  │
│  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────┘
```

**Key points:**
- Server-first: Server Components by default
- Database: PostgreSQL via Prisma ORM
- Auth: NextAuth v5 (JWT sessions)
- File storage: Vercel Blob
- Email: Resend (magic links)
- Deployment: Vercel

## Request Lifecycle Examples

### 1. User Loads Homepage

```
1. Browser → GET / → Next.js Server
2. Server executes app/(main)/page.tsx (Server Component)
3. page.tsx calls:
   - getSession() → NextAuth session check
   - prisma.software.findMany() → Database query
   - calculateTrendingScore() → In-memory calculation (if trending sort)
4. Server renders HTML with data
5. Response sent to browser
6. Browser hydrates React components
7. User sees product feed
```

**Files involved:**
- `app/(main)/page.tsx` - Homepage Server Component
- `lib/get-session.ts` - Session retrieval
- `lib/prisma.ts` - Database client
- `lib/filters.ts` - Sorting logic

### 2. User Opens Product Page

```
1. Browser → GET /product/[id] → Next.js Server
2. Server executes app/(main)/product/[id]/page.tsx
3. Server queries:
   - prisma.software.findUnique({ where: { id } }) → Product data
   - prisma.comment.findMany({ where: { productId } }) → Comments
   - prisma.upvote.findUnique() → Check if user upvoted
   - trackProductView() → Increment view count (async, doesn't block)
4. Server renders product page with data
5. Response sent to browser
```

**Files involved:**
- `app/(main)/product/[id]/page.tsx` - Product detail page
- `app/actions/analytics.ts` - View tracking

### 3. User Submits Product

```
1. Browser → POST form → Server Action
2. Server executes app/actions/software.ts → createSoftware()
3. Server Action:
   - getSession() → Verify authentication
   - checkRateLimit() → Rate limit check (5/day)
   - sanitizeInput() → Sanitize user input
   - prisma.software.create() → Create product
   - revalidatePath("/") → Invalidate Next.js cache
   - redirect("/") → Redirect to homepage
4. Homepage re-renders with new product
```

**Files involved:**
- `app/actions/software.ts` - createSoftware() Server Action
- `lib/rate-limit.ts` - Rate limiting
- `lib/utils.ts` - Input sanitization

---

**Next:** [Tech Stack →](02-TECH-STACK.md)
