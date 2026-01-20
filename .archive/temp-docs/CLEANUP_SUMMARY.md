# Project Cleanup Summary

## Files Cleaned Up

### ✅ Deleted
- `app/(main)/privacy/page.tsx.bak2` - Backup file
- `app/(main)/terms/page.tsx.bak2` - Backup file  
- `lib/cn.ts` - Duplicate utility (functionality exists in `lib/utils.ts`)

### ✅ Updated
- `app/components/typography.tsx` - Updated import from `@/lib/cn` to `@/lib/utils`
- `app/(main)/product/[id]/comment-item.tsx` - Updated `/builder/` to `/user/`
- `app/(main)/product/[id]/page.tsx` - Updated `/builder/` to `/user/` (2 occurrences)
- `app/(main)/search/page.tsx` - Updated `/builder/` to `/user/`

## Current Project Structure

### Active Routes
- `/` - Homepage
- `/submit` - Product submission
- `/product/[id]` - Product detail pages
- `/product/[id]/edit` - Edit product
- `/category/[slug]` - Category pages
- `/categories` - All categories
- `/user/[id]` - User profiles (main route)
- `/builder/[username]` - Legacy builder route (kept for backward compatibility)
- `/search` - Search page
- `/login`, `/signup` - Authentication
- `/pricing`, `/privacy`, `/terms`, `/faq`, `/llms.txt` - Static pages

### API Routes
- `/api/auth/[...nextauth]` - Authentication handlers
- `/api/upload` - Image upload to Vercel Blob
- `/api/seed-categories` - Category seeding
- `/api/dev/db-sync` - Dev-only DB schema sync
- `/api/dev/update-maker-field` - One-time maker field update
- `/api/debug-env` - Dev-only environment variable debugging
- `/api/create-product` - Legacy product creation (may be redundant)

### Components
All components in `app/components/` are actively used.

### Libraries
- `lib/utils.ts` - Main utilities (cn, getRelativeTime, sanitizeInput, sanitizeEmbedHtml)
- `lib/auth.ts` - NextAuth configuration
- `lib/prisma.ts` - Prisma client
- `lib/get-session.ts` - Session helper
- `lib/email.ts` - Email notifications (Resend)
- `lib/email-template.ts` - Magic link email templates
- `lib/filters.ts` - Product filtering logic
- `lib/rate-limit.ts` - Rate limiting
- `lib/cache.ts` - React cache utilities (not currently used, but kept for future use)
- `lib/design-system.ts` - Design tokens (not currently used, but kept for reference)

## Recommendations for Future Cleanup

### Files to Review (Currently Unused but Potentially Useful)
1. **`lib/cache.ts`** - React cache utilities. Keep if planning to implement query caching.
2. **`lib/design-system.ts`** - Design tokens. Keep for reference or remove if not using.
3. **`app/api/create-product/route.ts`** - Review if this is redundant with server actions.

### Archive Folder
The `.archive/` folder contains old CMS/PayloadCMS implementation attempts. This is already properly archived and doesn't affect the codebase.

### Root Documentation Files
Many markdown files at root level (e.g., `AUTH_SETUP.md`, `DEPLOYMENT.md`, etc.) provide useful documentation. Consider:
- Moving to a `docs/` folder for better organization
- Or keeping at root for quick access

### Scripts
Scripts in `scripts/` appear to be one-time migration utilities. Consider moving completed migrations to `.archive/scripts/`.

## Route Consistency

✅ **Resolved**: All internal links now use `/user/` instead of `/builder/` for consistency.
- The `/builder/[username]` route is kept for backward compatibility with external links
- Internal navigation consistently uses `/user/[id]` 

## Build Status

✅ All changes build successfully without errors.
