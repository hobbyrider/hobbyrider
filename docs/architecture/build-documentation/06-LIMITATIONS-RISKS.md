# PART 6 — Current Limitations, Risks, and "Things That Will Break"

**Previous:** [Frontend UI ←](05-FRONTEND-UI.md) | **Next:** [Scaling Plan →](07-SCALING-PLAN.md)

## Technical Debt (High Priority)

### 1. In-Memory Sorting for Trending/Comments ⚠️ **HIGH**

**Problem:** Homepage fetches up to 500 products, sorts in memory, then paginates.

**Evidence:**
```typescript
// app/(main)/page.tsx line 87
const take = requiresInMemorySort ? 500 : itemsPerPage // Fetch 500 for in-memory sorts
```

**Impact:**
- Loads 500 products into memory per request
- Slow queries on large datasets
- Wastes database bandwidth
- Doesn't scale beyond ~1000 products

**Fix:**
- Use database-level sorting (requires schema changes)
- Or cache sorted results (Redis)
- Or pre-calculate trending scores in database

**Files involved:** `app/(main)/page.tsx` lines 82-185

**Severity:** HIGH - Will break at scale (1000+ products)

---

### 2. No Database Migrations ⚠️ **MEDIUM**

**Problem:** Using `prisma db push` instead of migrations.

**Evidence:**
- No `prisma/migrations/` folder
- Build script: `"build": "prisma generate && next build"` (no migrations)
- Documentation references `prisma db push`

**Impact:**
- No migration history
- Risk of data loss in production
- Can't roll back schema changes
- Team members might have schema drift

**Fix:**
- Start using `prisma migrate dev`
- Create initial migration from current schema
- Update deployment to run migrations

**Severity:** MEDIUM - Production risk if schema changes are made incorrectly

---

### 3. No Test Coverage ⚠️ **HIGH**

**Problem:** No test files found in repository.

**Evidence:**
- No `*.test.*` or `*.spec.*` files
- No test setup in `package.json`
- No testing documentation

**Impact:**
- No confidence in changes
- Risk of regressions
- Manual testing required for every change
- Hard to refactor safely

**Fix:**
- Add Vitest or Jest
- Write unit tests for utilities (`lib/utils.ts`, `lib/filters.ts`)
- Write integration tests for Server Actions
- Add E2E tests for critical flows (submit, upvote, comment)

**Severity:** HIGH - No safety net for changes

---

### 4. Basic Search Implementation ⚠️ **MEDIUM**

**Problem:** PostgreSQL `LIKE` queries, no full-text search.

**Evidence:**
```typescript
// app/actions/search.ts
{ name: { contains: searchTerm, mode: "insensitive" } }
```

**Impact:**
- Slow on large datasets
- No ranking
- No fuzzy matching
- No stemming

**Fix:**
- PostgreSQL full-text search with `tsvector`
- Or external service (Meilisearch, Algolia)
- Add search indexes

**Files involved:** `app/actions/search.ts`

**Severity:** MEDIUM - Performance degrades with 1000+ products

---

### 5. No Error Tracking / Logging ⚠️ **MEDIUM**

**Problem:** Only `console.error()`, no external service.

**Evidence:**
- No Sentry, LogRocket, or similar
- Errors logged to console only
- No error aggregation or alerts

**Impact:**
- Production errors not visible
- No error tracking
- Hard to debug production issues
- No alerting

**Fix:**
- Integrate Sentry (recommended)
- Or use Vercel Analytics/Logs
- Add structured logging

**Severity:** MEDIUM - Production issues go unnoticed

---

## Security Risks

### 1. Basic HTML Sanitization ⚠️ **MEDIUM**

**Problem:** Custom sanitizer, not a vetted library.

**Evidence:**
```typescript
// lib/utils.ts lines 74-94
export function sanitizeEmbedHtml(input: string) {
  // Custom regex-based sanitization
  html = html.replace(/<script\b.../gi, "")
  // ...
}
```

**Risk:** Vulnerable to XSS if sanitization misses edge cases.

**Fix:** Use DOMPurify or similar.

**Severity:** MEDIUM - Embedded HTML might be vulnerable

---

### 2. Rate Limiting via Database Queries ⚠️ **LOW**

**Current implementation:**
```typescript
// lib/rate-limit.ts
count = await prisma.software.count({
  where: { makerId: userId, createdAt: { gte: windowStart } },
})
```

**Risk:**
- Adds database queries per action
- Could be bypassed with connection issues (fail-open)
- No distributed rate limiting

**Fix:** Use Redis or Vercel Edge rate limiting.

**Severity:** LOW - Works but inefficient

---

### 3. No CSRF Protection Beyond Next.js Default ⚠️ **LOW**

**Current state:** Next.js provides CSRF protection by default for Server Actions.

**Risk:** Unknown if sufficient for all cases.

**Severity:** LOW - Next.js handles this, but worth monitoring

---

## Performance Bottlenecks

### 1. No Query Result Caching ⚠️ **MEDIUM**

**Problem:** Database queries run on every request.

**Evidence:**
- No Redis cache
- No Next.js data cache (except homepage `revalidate = 60`)
- All pages `force-dynamic`

**Impact:**
- Database load increases with traffic
- Slower response times
- Higher database costs

**Fix:**
- Add Redis for query caching
- Use Next.js data cache where appropriate
- Cache user sessions

**Severity:** MEDIUM - Will hit database hard under load

---

### 2. Large Payloads (500 Products Fetch) ⚠️ **HIGH**

**Problem:** Trending/comments sorting fetches 500 products.

**Evidence:**
```typescript
// app/(main)/page.tsx line 87
const take = requiresInMemorySort ? 500 : itemsPerPage
```

**Impact:**
- Large database responses
- High memory usage
- Slow queries

**Severity:** HIGH - Already identified in technical debt

---

### 3. N+1 Query Potential ⚠️ **LOW**

**Current state:** Prisma `include` prevents most N+1, but verify.

**Example (good):**
```typescript
// app/(main)/page.tsx - Single query with includes
prisma.software.findMany({
  include: {
    categories: { select: { id: true, name: true, slug: true } },
    _count: { select: { comments: true } },
  },
})
```

**Potential issues:**
- Upvote status check (separate query for each page load)
- Maker user lookup (might be separate)

**Fix:** Batch queries where possible.

**Severity:** LOW - Looks optimized, but monitor

---

### 4. No Image Optimization ⚠️ **MEDIUM**

**Problem:** Images not resized or converted to WebP.

**Evidence:**
- `next.config.ts`: `unoptimized: true` in development
- No image resizing pipeline
- Users upload full-size images

**Impact:**
- Large image files
- Slow page loads
- High bandwidth usage

**Fix:**
- Enable Next.js Image optimization in production
- Add image resizing on upload
- Convert to WebP format

**Severity:** MEDIUM - Performance impact on mobile

---

## Observability Gaps

### 1. No Structured Logging ⚠️ **MEDIUM**

**Problem:** Only `console.error()` with no structured format.

**Impact:**
- Hard to search logs
- No log aggregation
- No correlation IDs

**Fix:** Add structured logging (Winston, Pino) or use Vercel Logs.

---

### 2. No Error Monitoring ⚠️ **HIGH**

**Problem:** No external error tracking service.

**Impact:**
- Production errors not visible
- No error alerts
- Hard to debug production issues

**Fix:** Integrate Sentry (recommended).

**Severity:** HIGH - Critical for production

---

### 3. No Performance Monitoring ⚠️ **MEDIUM**

**Problem:** No APM or performance tracking.

**Impact:**
- Don't know slow queries
- Don't know slow pages
- Can't optimize based on data

**Fix:** Add Vercel Analytics or custom performance tracking.

---

## Recent Stabilization Work ✅

**Status:** Build stabilized in January 2025

**Completed:**
- ✅ Removed debug logging code (18 instances)
- ✅ Converted legacy `/builder/[username]` route to redirect
- ✅ Simplified error handling
- ✅ Build passes without errors

**Current State:**
- ✅ Build status: Stable
- ✅ No critical bugs identified
- ✅ Code structure clean and organized
- ⚠️ Type safety: Acceptable (54 `as any` casts, monitored)

---

**Previous:** [Frontend UI ←](05-FRONTEND-UI.md) | **Next:** [Scaling Plan →](07-SCALING-PLAN.md)
