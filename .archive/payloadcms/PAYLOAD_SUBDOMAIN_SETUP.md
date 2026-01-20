# PayloadCMS Subdomain Setup Guide

## Overview

You want to use `payload.hobbyrider.io` for PayloadCMS admin to create blog posts. This guide will help you set it up properly.

## Current Situation

- ✅ Subdomain `payload.hobbyrider.io` is configured in Vercel
- ❌ Currently shows main app homepage (not PayloadCMS)
- ✅ PayloadCMS code exists in `.archive/payloadcms/code/` (disabled)

## Setup Options

You have **two options**:

### Option 1: Separate Vercel Project (Recommended)

Create a completely separate Next.js project for PayloadCMS. This is the cleanest approach.

**Pros:**
- ✅ No conflicts with main app
- ✅ Independent deployments
- ✅ Clean separation of concerns
- ✅ Easier to maintain

**Cons:**
- ❌ Need to manage two projects
- ❌ Need to duplicate some config

### Option 2: Same Project with Subdomain Routing (Current Approach)

Use middleware to route based on subdomain within the same project.

**Pros:**
- ✅ Single codebase
- ✅ Shared database
- ✅ Single deployment

**Cons:**
- ❌ More complex setup
- ❌ Potential conflicts (why it was disabled before)

## Recommended: Option 1 - Separate Project

Since PayloadCMS was previously disabled due to conflicts, I recommend creating a separate project.

### Step 1: Create New Vercel Project

1. Go to Vercel Dashboard
2. Create a new project from the same GitHub repository
3. Configure it to deploy from a specific branch or directory

### Step 2: Set Up PayloadCMS Project Structure

Create a new directory structure for PayloadCMS:

```
payload-cms/
├── app/
│   └── admin/
│       └── [[...segments]]/
│           └── page.tsx
├── collections/
│   ├── BlogPosts.ts
│   ├── Media.ts
│   ├── Pages.ts
│   └── Users.ts
├── payload.config.ts
├── package.json
└── next.config.ts
```

### Step 3: Install PayloadCMS Dependencies

```bash
cd payload-cms
npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/next
```

### Step 4: Configure Vercel

1. In Vercel project settings:
   - Set **Production Domain** to `payload.hobbyrider.io`
   - Add environment variables:
     - `DATABASE_URL` (same as main app)
     - `PAYLOAD_SECRET` (generate with `openssl rand -base64 32`)
     - `NEXTAUTH_URL=https://payload.hobbyrider.io`

### Step 5: Deploy

Push your PayloadCMS code and deploy to the subdomain.

---

## Alternative: Option 2 - Same Project with Middleware

If you want to use the same project, follow these steps:

### Step 1: Install PayloadCMS

```bash
npm install payload @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/next
```

### Step 2: Restore PayloadCMS Code

```bash
# Copy PayloadCMS code from archive
cp -r .archive/payloadcms/code/collections ./collections
cp .archive/payloadcms/code/payload.config.ts ./payload.config.ts

# Restore admin routes
mkdir -p app/\(payload\)/admin/\[\[...segments\]\]
cp .archive/payloadcms/code/\(payload-disabled\)/admin/\[\[...segments\]\]/* app/\(payload\)/admin/\[\[...segments\]\]/
```

### Step 3: Update Middleware

The middleware I created will route based on subdomain. Update it to properly handle PayloadCMS:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isPayloadSubdomain = hostname.startsWith('payload.') || 
                             hostname.includes('payload.hobbyrider.io')

  // For payload subdomain, allow PayloadCMS routes
  if (isPayloadSubdomain) {
    // Block main app routes on payload subdomain
    if (request.nextUrl.pathname.startsWith('/product') ||
        request.nextUrl.pathname.startsWith('/category') ||
        request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // For main domain, block PayloadCMS admin
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/moderation')) {
    // Allow your existing admin routes, block PayloadCMS
    return NextResponse.next()
  }

  return NextResponse.next()
}
```

### Step 4: Update next.config.ts

```typescript
import { withPayload } from '@payloadcms/next/withPayload'

// ... existing config ...

// Conditionally enable PayloadCMS
const config = process.env.ENABLE_PAYLOAD === 'true' 
  ? withPayload(nextConfig)
  : nextConfig

export default withSentryConfig(config, { ... })
```

### Step 5: Set Environment Variables

In Vercel, add:
- `PAYLOAD_SECRET` (generate with `openssl rand -base64 32`)
- `ENABLE_PAYLOAD=true` (only for payload subdomain if using conditional)

### Step 6: Configure Vercel Rewrites

In Vercel project settings, you might need to configure rewrites to properly route the subdomain.

---

## Quick Start: Separate Project (Recommended)

If you want to get started quickly, I recommend the separate project approach:

1. **Create a new branch or directory** for PayloadCMS
2. **Copy PayloadCMS code** from `.archive/payloadcms/code/`
3. **Create minimal Next.js app** with PayloadCMS
4. **Deploy as separate Vercel project**
5. **Point subdomain** to the new project

This avoids all the conflicts that caused PayloadCMS to be disabled before.

---

## Which Option Should You Choose?

**Choose Option 1 (Separate Project) if:**
- ✅ You want the cleanest setup
- ✅ You want independent deployments
- ✅ You had conflicts before (which you did)
- ✅ You want to avoid future issues

**Choose Option 2 (Same Project) if:**
- ✅ You want everything in one codebase
- ✅ You're okay with more complex setup
- ✅ You want to share more code between apps

---

## Next Steps

1. **Decide which option** you prefer
2. **Let me know** and I'll help you implement it
3. **Test locally** before deploying
4. **Configure Vercel** subdomain routing

---

## Troubleshooting

### Subdomain shows main app
- Check Vercel domain configuration
- Verify middleware is working
- Check Vercel rewrites/redirects

### PayloadCMS not loading
- Verify `PAYLOAD_SECRET` is set
- Check `DATABASE_URL` is correct
- Review PayloadCMS logs in Vercel

### Database connection errors
- Ensure `DATABASE_URL` is set in both projects (if separate)
- Check database allows connections from Vercel IPs
- Verify connection pooling is configured

---

**Recommendation**: Go with **Option 1 (Separate Project)** for the cleanest, most maintainable setup.
