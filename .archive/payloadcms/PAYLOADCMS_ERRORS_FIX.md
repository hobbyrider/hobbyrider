# PayloadCMS Admin Errors - Common Fixes

## Common Errors When Visiting `/admin/login`

### 1. Import Map Errors
**Error**: `Cannot find module './admin/importMap'` or similar

**Fix**: Ensure you're importing from `importMap.js` (not `.ts`):
```typescript
import { importMap } from './admin/importMap.js'
```

### 2. PAYLOAD_SECRET Missing
**Error**: `missing secret key. A secret key is needed to secure Payload`

**Fix**: Add to `.env.local`:
```bash
PAYLOAD_SECRET=your_generated_secret
```

Generate with:
```bash
openssl rand -base64 32
```

### 3. Database Connection Errors
**Error**: `Failed query: SELECT conname AS primary_key`

**Fix**: 
- Ensure `DATABASE_URL` is set in `.env.local`
- Check database is accessible
- Set `push: false` in `payload.config.ts` if using Prisma migrations

### 4. Duplicate Route Structure
**Error**: Multiple admin routes or 404 errors

**Fix**: Ensure only one admin route structure:
- `app/(payload)/admin/[[...segments]]/page.tsx` ✅
- Remove any duplicate `app/(payload)/admin/admin/` directories ❌

### 5. TypeScript Import Errors
**Error**: Module resolution errors for PayloadCMS packages

**Fix**: 
- Clear `.next` cache: `rm -rf .next`
- Restart dev server
- Ensure all PayloadCMS packages are installed

### 6. Hydration Errors
**Error**: Nested `<html>` tags

**Fix**: Already handled with `suppressHydrationWarning` in root layout

### 7. Missing Collections
**Error**: Collections not found or undefined

**Fix**: Ensure all collections are imported in `payload.config.ts`:
```typescript
collections: [
  Users,
  BlogPosts,
  Pages,
  Media,
]
```

### 8. Server Function Errors
**Error**: `serverFunction` or `handleServerFunctions` errors

**Fix**: Ensure `serverFunction` is properly defined with `'use server'`:
```typescript
const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}
```

## Quick Diagnostic Checklist

- [ ] `PAYLOAD_SECRET` is set in `.env.local`
- [ ] `DATABASE_URL` is set and accessible
- [ ] Import map is using `.js` extension
- [ ] No duplicate admin directories
- [ ] All collections are imported in `payload.config.ts`
- [ ] `.next` cache is cleared
- [ ] Dev server is restarted

## If Errors Persist

1. **Check browser console** for specific error messages
2. **Check terminal** for server-side errors
3. **Verify environment variables** are loaded
4. **Check PayloadCMS logs** in terminal output
5. **Try accessing** `/api/payload` directly to test API
