# PART 8 — "How to Work Safely" Playbook

**Previous:** [Scaling Plan ←](07-SCALING-PLAN.md) | **Next:** [Quick Reference →](09-QUICK-REFERENCE.md)

## How to Add a New Feature Without Breaking Stuff

### Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm run dev
# Test in browser

# 4. Lint and type check
npm run lint
npx tsc --noEmit

# 5. Commit
git add .
git commit -m "Add feature: description"

# 6. Push and create PR
git push origin feature/new-feature-name
# Create PR on GitHub

# 7. After review, merge to main
# Vercel auto-deploys main branch
```

### PR Checklist

Before merging:

- [ ] Code compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] Tested locally (`npm run dev`)
- [ ] Tested on mobile viewport (320px-640px)
- [ ] No `console.log()` statements (use `console.error()` if needed)
- [ ] Environment variables documented (if new)
- [ ] Database schema changes reviewed (if any)

---

## Local Dev Checklist

**Before starting work:**

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Check environment variables:**
   - `.env.local` exists
   - `DATABASE_URL` is set
   - `NEXTAUTH_SECRET` is set (local dev)

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

**Common issues:**
- Prisma Client out of date → Run `npx prisma generate`
- Type errors → Run `npx tsc --noEmit`
- Build cache issues → Run `npm run dev:clean`

---

## Migrations Checklist

**Current state:** Using `prisma db push` (not migrations).

**Before schema changes:**

1. **Backup database** (if production)
2. **Update schema:** `prisma/schema.prisma`
3. **Push to database:** `npx prisma db push`
4. **Generate client:** `npx prisma generate` (auto-runs on `postinstall`)

**⚠️ Warning:** `db push` doesn't create migration history. For production, switch to migrations first.

**Future (with migrations):**
```bash
# Create migration
npx prisma migrate dev --name descriptive-name

# Review migration SQL
# Check prisma/migrations/[timestamp]_descriptive-name/migration.sql

# Apply to production (during deployment)
npx prisma migrate deploy
```

---

## Deployment Checklist

**Before deploying:**

1. **Check environment variables:**
   - [ ] All required vars set in Vercel
   - [ ] `DATABASE_URL` is production database
   - [ ] `NEXTAUTH_URL` matches production URL

2. **Verify build succeeds:**
   ```bash
   npm run build
   ```

3. **Check for breaking changes:**
   - [ ] Database schema changes (if any) are safe
   - [ ] No new required environment variables (or set in Vercel)
   - [ ] No deprecated API usage

4. **Deploy:**
   - Push to `main` → Auto-deploy on Vercel
   - Or manually: `vercel --prod`

5. **Verify deployment:**
   - [ ] Homepage loads
   - [ ] Authentication works
   - [ ] Product submission works
   - [ ] No errors in Vercel logs

---

## Coding Standards

Based on codebase patterns:

### TypeScript

- **Strict mode:** Enabled in `tsconfig.json`
- **Type imports:** Use `import type` for types
- **Any types:** Avoid `any` (some usage in `app/actions/software.ts` for Prisma types)

### Naming Conventions

- **Files:** kebab-case (`feed-item-card.tsx`)
- **Components:** PascalCase (`FeedItemCard`)
- **Functions:** camelCase (`createSoftware`)
- **Server Actions:** Mark with `"use server"`

### Component Patterns

**Server Components (default):**
```typescript
// app/(main)/page.tsx
export default async function Home() {
  const data = await prisma.software.findMany()
  return <div>{/* render */}</div>
}
```

**Client Components:**
```typescript
// app/components/upvote-button.tsx
"use client"
import { useState } from "react"
export function UpvoteButton() { /* ... */ }
```

### Error Handling

**Current pattern:**
```typescript
try {
  await prisma.software.create({ data })
} catch (error) {
  console.error("Error:", error)
  throw new Error("User-friendly message")
}
```

**Recommendation:** Add structured error handling (custom error types).

---

## Definition of Done for Hobbyrider Features

A feature is "done" when:

1. **Functionality works:**
   - Feature works as expected
   - Tested in browser (Chrome, Safari)
   - Tested on mobile (320px-640px)

2. **Code quality:**
   - TypeScript compiles without errors
   - ESLint passes
   - Follows existing code patterns

3. **Database changes (if any):**
   - Schema updated (`prisma/schema.prisma`)
   - Prisma Client regenerated
   - Data migration script (if needed)

4. **UI/UX:**
   - Responsive design (mobile, tablet, desktop)
   - Accessible (keyboard navigation, screen readers)
   - Error states handled

5. **Performance:**
   - No obvious performance issues
   - Database queries optimized (no N+1)
   - Images optimized (if applicable)

6. **Security:**
   - Input sanitized
   - Auth checks in place
   - Rate limiting (if applicable)

7. **Documentation:**
   - Code is self-documenting or commented
   - Environment variables documented (if new)

---

**Previous:** [Scaling Plan ←](07-SCALING-PLAN.md) | **Next:** [Quick Reference →](09-QUICK-REFERENCE.md)
