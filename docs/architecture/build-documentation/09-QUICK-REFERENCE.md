# PART 9 — Quick Reference and Next Actions

**Previous:** [Work Playbook ←](08-WORK-PLAYBOOK.md)

## Next Actions for Founder (Priority Order)

Based on repository analysis, here are the **Top 5 Things to Do Next**:

### 1. Add Error Tracking (Sentry) ⚠️ **HIGH PRIORITY**

**Why:** Can't see production errors currently. Critical for production visibility.

**Action:**
- Sign up for Sentry (free tier)
- Install: `npm install @sentry/nextjs`
- Run setup wizard: `npx @sentry/wizard@latest -i nextjs`
- Test error reporting
- Set up alerts

**Impact:** Visibility into production issues, error alerts, better debugging.

**Time:** 1-2 hours

**Files to modify:**
- `app/layout.tsx` - Add Sentry initialization
- `next.config.ts` - Sentry webpack plugin
- `package.json` - Add Sentry dependencies

---

### 2. Fix In-Memory Sorting for Trending/Comments ⚠️ **HIGH PRIORITY**

**Why:** Fetches 500 products per request; won't scale beyond ~1000 products.

**Action:**
- Create database view or computed column for trending score
- Update Prisma schema (if using computed column)
- Update homepage query to use database sorting
- Test with large datasets

**Impact:** Prevents performance issues at scale, reduces database load.

**Time:** 4-6 hours

**Files to modify:**
- `app/(main)/page.tsx` - Remove in-memory sorting
- `prisma/schema.prisma` - Add computed columns or indexes
- `lib/filters.ts` - Update sorting logic

---

### 3. Set Up Database Migrations ⚠️ **MEDIUM PRIORITY**

**Why:** Current `db push` workflow is risky for production. No migration history, can't roll back.

**Action:**
- Create initial migration: `npx prisma migrate dev --name init`
- Update deployment to run `prisma migrate deploy`
- Document migration workflow

**Impact:** Safe schema changes with rollback capability.

**Time:** 2-3 hours

**Files to modify:**
- `prisma/schema.prisma`
- Create `prisma/migrations/` (initial migration)
- Update deployment scripts

---

### 4. Add Basic Testing ⚠️ **MEDIUM PRIORITY**

**Why:** No tests means risky changes. No safety net for refactoring.

**Action:**
- Install Vitest: `npm install -D vitest @testing-library/react`
- Write unit tests for `lib/utils.ts` (sanitization, time formatting)
- Write integration test for `createSoftware()` Server Action

**Impact:** Confidence in changes, prevent regressions.

**Time:** 4-6 hours

**Files to create:**
- `__tests__/` directory
- `vitest.config.ts` - Test configuration
- Test files for critical functions

---

### 5. Improve Search Implementation ⚠️ **MEDIUM PRIORITY**

**Why:** Basic PostgreSQL `LIKE` queries will slow down with 1000+ products.

**Action:**
- Option A: PostgreSQL full-text search with `tsvector` (simpler, no new service)
- Option B: Meilisearch (better, requires new service)
- Add search indexes

**Impact:** Faster, more accurate search with ranking.

**Time:** 4-6 hours

**Files to modify:**
- `app/actions/search.ts` - Update search implementation
- `prisma/schema.prisma` - Add full-text search indexes (if Option A)

---

## Additional Recommendations (Lower Priority)

6. **Image Optimization** - Enable Next.js Image optimization and add resizing (2-3 hours)
7. **Query Caching** - Add Redis for query result caching (4-6 hours)
8. **Performance Monitoring** - Add Vercel Analytics or custom tracking (2-3 hours)
9. **CI/CD Pipeline** - Add GitHub Actions for automated checks (4-6 hours)
10. **Background Jobs** - Use Vercel Cron Jobs for heavy tasks (1-2 weeks)

---

## Quick Reference

### Key File Paths

| What | Where |
|------|-------|
| Homepage | `app/(main)/page.tsx` |
| Product detail | `app/(main)/product/[id]/page.tsx` |
| Submit form | `app/(main)/submit/page.tsx` |
| Database schema | `prisma/schema.prisma` |
| Prisma client | `lib/prisma.ts` |
| Auth config | `lib/auth.ts` |
| Product actions | `app/actions/software.ts` |
| Comment actions | `app/actions/comments.ts` |
| Search | `app/actions/search.ts` |
| File upload | `app/api/upload/route.ts` |
| User profile edit | `app/(main)/user/[id]/edit/edit-form.tsx` |
| Admin moderation | `app/admin/moderation/page.tsx` |

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run dev:clean         # Clean build and restart dev server

# Database
npx prisma db push       # Push schema to database (dev only)
npx prisma generate       # Generate Prisma Client
npx prisma studio        # Open database GUI
npx prisma db reset      # Reset database (⚠️ deletes data)

# Deployment
vercel --prod            # Deploy to production
git push origin main     # Auto-deploy on Vercel (if connected)
```

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT signing secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Production URL (`https://hobbyrider.vercel.app`)

**Optional:**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Magic link emails
- `BLOB_READ_WRITE_TOKEN` - File uploads (auto-provided on Vercel)

### Current Project Status

**Build Status:** ✅ **STABLE**
- Build passes without errors
- No critical bugs identified
- Debug code removed
- Legacy routes properly redirected

**Tech Stack:**
- Next.js 16.1.1 (App Router)
- React 19.2.3
- Prisma 7.2.0 + PostgreSQL
- NextAuth v5 (beta.30)
- Tailwind CSS v4
- TypeScript (strict mode)

**Known Issues:**
- ⚠️ In-memory sorting (500 products fetch) - HIGH priority fix
- ⚠️ No error tracking - HIGH priority fix
- ⚠️ No test coverage - HIGH priority fix
- ⚠️ No database migrations - MEDIUM priority fix
- ⚠️ Basic search implementation - MEDIUM priority fix

**Recent Improvements:**
- ✅ Removed debug logging code
- ✅ Legacy route redirects
- ✅ Code stabilization
- ✅ Build optimization

---

## Founder's Quick Decision Guide

### "Should I add feature X?"

**Check these first:**
1. Does it require database changes? → Review migration strategy
2. Does it affect performance? → Check if it triggers 500-product fetch
3. Does it need auth? → Use `getSession()` pattern
4. Does it need rate limiting? → Use `checkRateLimit()` pattern

### "Where should I put this code?"

- **New page/route:** `app/(main)/[route]/page.tsx`
- **Server-side logic:** `app/actions/[name].ts`
- **API endpoint:** `app/api/[name]/route.ts`
- **Reusable component:** `app/components/[name].tsx`
- **Utility function:** `lib/[name].ts`
- **Database change:** `prisma/schema.prisma`

### "Is this production-ready?"

**Checklist:**
- [ ] Build passes (`npm run build`)
- [ ] Tested on mobile (320px-640px)
- [ ] No `console.log()` statements
- [ ] Input sanitized (if user input)
- [ ] Auth checks in place (if needed)
- [ ] Rate limiting (if user action)
- [ ] Error handling implemented

---

**Previous:** [Work Playbook ←](08-WORK-PLAYBOOK.md)

**Back to:** [Index](00-INDEX.md)

---

*Last updated: January 2025 - Based on current repository state*
