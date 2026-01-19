# PART 7 — Scaling Plan (Priority Roadmap)

**Previous:** [Limitations & Risks ←](06-LIMITATIONS-RISKS.md) | **Next:** [Work Playbook →](08-WORK-PLAYBOOK.md)

## Phase 1: Stability (1-2 weeks)

### Priority 1.1: Fix In-Memory Sorting ⚠️ **HIGH**

**What it solves:** Prevents performance issues with 1000+ products.

**Approach:** Database-level sorting for trending/comments.

**Files involved:**
- `app/(main)/page.tsx` - Remove in-memory sorting
- `prisma/schema.prisma` - Add computed columns or indexes

**Complexity:** MEDIUM

**Steps:**
1. Create database view or computed column for trending score
2. Update Prisma schema (if using computed column)
3. Update homepage query to use database sorting
4. Test with large datasets

**Estimated time:** 4-6 hours

---

### Priority 1.2: Add Error Tracking ⚠️ **HIGH**

**What it solves:** Visibility into production errors.

**Approach:** Integrate Sentry.

**Files involved:**
- `app/layout.tsx` - Add Sentry initialization
- `next.config.ts` - Sentry webpack plugin
- `package.json` - Add Sentry dependencies

**Complexity:** SMALL

**Steps:**
1. `npm install @sentry/nextjs`
2. Run Sentry setup wizard
3. Test error reporting
4. Set up alerts

**Estimated time:** 1-2 hours

---

### Priority 1.3: Database Migrations ⚠️ **MEDIUM**

**What it solves:** Safe schema changes with rollback.

**Approach:** Migrate from `db push` to migrations.

**Files involved:**
- `prisma/schema.prisma`
- Create `prisma/migrations/` (initial migration)

**Complexity:** SMALL

**Steps:**
1. Create initial migration: `npx prisma migrate dev --name init`
2. Update deployment to run migrations
3. Document migration workflow

**Estimated time:** 2-3 hours

---

## Phase 2: Performance (2-4 weeks)

### Priority 2.1: Query Result Caching ⚠️ **MEDIUM**

**What it solves:** Reduces database load and improves response times.

**Approach:** Add Redis for query caching.

**Files involved:**
- `lib/cache.ts` - Add Redis client
- `app/(main)/page.tsx` - Cache product queries
- `app/actions/search.ts` - Cache search results

**Complexity:** MEDIUM

**Dependencies:** Redis service (Upstash Redis, Railway, etc.)

**Estimated time:** 4-6 hours

---

### Priority 2.2: Improve Search ⚠️ **MEDIUM**

**What it solves:** Faster, more accurate search.

**Options:**
- **A)** PostgreSQL full-text search (simpler, no new service)
- **B)** Meilisearch (better, requires new service)

**Files involved:**
- `app/actions/search.ts` - Update search implementation
- `prisma/schema.prisma` - Add full-text search indexes (if Option A)

**Complexity:** MEDIUM

**Estimated time:** 4-6 hours

---

### Priority 2.3: Image Optimization ⚠️ **MEDIUM**

**What it solves:** Faster page loads, lower bandwidth.

**Approach:**
- Enable Next.js Image optimization in production
- Add image resizing on upload

**Files involved:**
- `next.config.ts` - Enable image optimization
- `app/api/upload/route.ts` - Add image resizing (sharp library)

**Complexity:** SMALL

**Estimated time:** 2-3 hours

---

## Phase 3: Scale (1-3 months)

### Priority 3.1: Background Jobs for Heavy Tasks ⚠️ **LOW**

**What it solves:** Offload heavy operations (image processing, analytics).

**Approach:** Use Vercel Cron Jobs or external queue (Inngest, Trigger.dev).

**Files involved:**
- New: `app/api/cron/` - Cron job handlers

**Complexity:** LARGE

**Estimated time:** 1-2 weeks

---

### Priority 3.2: Comprehensive Testing ⚠️ **HIGH**

**What it solves:** Confidence in changes, prevent regressions.

**Approach:**
- Unit tests for utilities
- Integration tests for Server Actions
- E2E tests for critical flows

**Files involved:**
- New: `__tests__/` directory
- `vitest.config.ts` - Test configuration

**Complexity:** LARGE

**Estimated time:** 1-2 weeks

---

### Priority 3.3: CI/CD Pipeline ⚠️ **MEDIUM**

**What it solves:** Automated checks before deployment.

**Approach:** GitHub Actions for linting, type checking, tests.

**Files involved:**
- New: `.github/workflows/ci.yml`

**Complexity:** MEDIUM

**Estimated time:** 4-6 hours

---

## Priority Summary for Founder

### Immediate (This Week)
1. **Add Error Tracking (Sentry)** - 1-2 hours ⚠️ **HIGH**
   - Critical for production visibility
   - Easy to implement
   - High impact

2. **Fix In-Memory Sorting** - 4-6 hours ⚠️ **HIGH**
   - Prevents future performance issues
   - Will break at 1000+ products
   - Medium complexity

### Short Term (This Month)
3. **Database Migrations** - 2-3 hours ⚠️ **MEDIUM**
   - Safe schema changes
   - Production safety
   - Low complexity

4. **Image Optimization** - 2-3 hours ⚠️ **MEDIUM**
   - Better mobile performance
   - Lower bandwidth costs
   - Low complexity

### Medium Term (Next 2-3 Months)
5. **Query Caching (Redis)** - 4-6 hours ⚠️ **MEDIUM**
   - Reduces database load
   - Better response times
   - Requires new service

6. **Comprehensive Testing** - 1-2 weeks ⚠️ **HIGH**
   - Confidence in changes
   - Prevents regressions
   - Large effort but high value

---

**Previous:** [Limitations & Risks ←](06-LIMITATIONS-RISKS.md) | **Next:** [Work Playbook →](08-WORK-PLAYBOOK.md)
