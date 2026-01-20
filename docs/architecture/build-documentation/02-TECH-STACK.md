# PART 2 — Tech Stack and Why It Matters

## Framework: Next.js 16.1.1 (App Router)

**What it is:** React framework with Server Components by default.

**Location in repo:**
- Configuration: `next.config.ts`
- Pages: `app/` directory
- Routes: File-based routing

**Key features used:**
- Server Components (default, no `"use client"`)
- Server Actions (`app/actions/` directory)
- API Routes (`app/api/` directory)
- Dynamic routing (`[id]`, `[slug]` patterns)
- Metadata API (`export const metadata`)
- Image optimization (disabled in dev, enabled in prod)

**Configuration:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: '**' }, // Allow any HTTPS image
    ],
  },
}
```

**Limitations:**
- In-memory sorting for trending/comments (fetches 500 items)
- No ISR (Incremental Static Regeneration)
- All pages are dynamic (`force-dynamic`)

**Why it matters:** Server-first reduces JavaScript bundle size and enables direct database access without API routes.

---

## Data Layer: Prisma 7.2.0 + PostgreSQL

**What it is:** Type-safe ORM for PostgreSQL database.

**Location in repo:**
- Schema: `prisma/schema.prisma` (203 lines, 11 models)
- Config: `prisma.config.ts` (connection URL)
- Client: `lib/prisma.ts` (singleton with connection pooling)

**Database models (11 total):**
1. `Software` (Products) - Core entity
2. `User` - Authentication and profiles
3. `Comment` - Product comments
4. `Upvote` - User upvotes
5. `Category` - Product categories
6. `ProductImage` - Product screenshots
7. `Report` - Moderation reports
8. `Follow` - User follows
9. `Account`, `Session`, `VerificationToken` - NextAuth tables

**Connection setup:**
```typescript
// lib/prisma.ts
const pool = new Pool({ connectionString: getDatabaseUrl() })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})
```

**Indexes (from schema):**
- `Software`: `[upvotes, createdAt]`, `[viewCount, createdAt]`, `[makerId]`, `[isHidden]`
- `Comment`: `[productId, createdAt]`, `[authorId]`, `[isHidden]`
- `Upvote`: `[userId, productId]` (unique), `[productId]`, `[userId]`
- `User`: `[email]`, `[username]`, `[isAdmin]`

**Limitations:**
- **No migrations folder** (using `prisma db push` in dev)
- `_count` sorting must be done in memory (trending, comments)
- Connection pooling via PrismaPg, but no explicit pool size config

**Why it matters:** Type safety prevents SQL injection and provides autocomplete. Prisma Client is generated from the schema.

---

## Authentication: NextAuth v5 (Beta 30)

**What it is:** Authentication system with multiple providers.

**Location:** `lib/auth.ts` (240 lines)

**Providers configured:**
1. **Credentials** (email/password) - bcrypt hashing
2. **Google OAuth** - Conditional (if env vars set)
3. **Magic Link** (email) - Resend or SMTP

**Configuration:**
```typescript
// lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/login", signOut: "/", error: "/login" },
})
```

**Session retrieval:**
```typescript
// lib/get-session.ts
export async function getSession() {
  return await auth()
}
```

**Limitations:**
- **Beta version** (v5.0.0-beta.30) - may have breaking changes
- JWT sessions only (no database sessions)
- Magic link requires Resend API key or SMTP config

**Why it matters:** Supports multiple providers and handles sessions securely.

---

## Caching Strategy: Next.js Cache + React Cache

**Current state:** Minimal caching implemented.

**What's cached:**
- React cache for query deduplication (utility exists but not widely used)
- Next.js automatic request memoization in Server Components
- Homepage has `revalidate = 60` (60-second revalidation)

**Location:**
- React cache utility: `lib/cache.ts` (exists but unused)
- Revalidation: `app/(main)/page.tsx` line 2

**Example:**
```typescript
// app/(main)/page.tsx
export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate homepage every 60 seconds
```

**Limitations:**
- No Redis or external cache
- Most pages are `force-dynamic` (no static generation)
- No query result caching (database queries run on every request)

**Why it matters:** Current setup queries the database frequently. A proper cache would reduce load.

---

## Search: PostgreSQL Full-Text Search

**What it is:** Basic search using PostgreSQL `LIKE` queries.

**Location:** `app/actions/search.ts`

**Implementation:**
```typescript
// app/actions/search.ts
const results = await prisma.software.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { tagline: { contains: searchTerm, mode: "insensitive" } },
      { maker: { contains: searchTerm, mode: "insensitive" } },
      { categories: { some: { name: { contains: searchTerm, mode: "insensitive" } } } },
    ],
  },
  take: 50,
})
```

**Limitations:**
- No full-text search indexes
- No ranking
- Limited to 50 results
- Case-insensitive but no stemming or fuzzy matching
- Performance degrades on large datasets

**Why it matters:** Works for small scale. For larger scale, consider PostgreSQL full-text search, Meilisearch, or Algolia.

---

## File Storage: Vercel Blob

**What it is:** Cloud blob storage for images.

**Location:** `app/api/upload/route.ts`

**Implementation:**
```typescript
// app/api/upload/route.ts
import { put } from "@vercel/blob"

const blob = await put(filename, file, {
  access: "public",
  contentType: file.type,
})
uploadedUrls.push(blob.url)
```

**Configuration:**
- Token: `BLOB_READ_WRITE_TOKEN` (env var, auto-provided on Vercel)
- Max size: 10MB (enforced in code)
- Allowed types: Images only
- Storage: `uploads/` prefix in Vercel Blob

**Limitations:**
- No image resizing/optimization
- No thumbnail generation
- Fallback to local filesystem in dev (doesn't persist)

**Why it matters:** Provides reliable cloud storage suitable for production.

---

**Previous:** [Executive Overview ←](01-EXECUTIVE-OVERVIEW.md) | **Next:** [Project Structure →](03-PROJECT-STRUCTURE.md)
