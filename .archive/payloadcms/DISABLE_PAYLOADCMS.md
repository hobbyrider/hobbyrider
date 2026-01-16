# How to Temporarily Disable PayloadCMS

## Quick Disable (Recommended)

### Method 1: Rename Route Group (Easiest)

```bash
# This disables all PayloadCMS routes
mv app/\(payload\) app/\(payload-disabled\)
```

**Result:**
- ✅ `/admin` routes won't be accessible
- ✅ No errors in console
- ✅ Main app works normally
- ✅ Easy to re-enable later

**To re-enable:**
```bash
mv app/\(payload-disabled\) app/\(payload\)
```

### Method 2: Comment Out in next.config.ts

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";
// import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // ... your config
};

// Temporarily disable PayloadCMS
// export default withPayload(nextConfig)
export default nextConfig
```

**To re-enable:**
- Uncomment the lines

---

## What Gets Disabled

- ❌ `/admin` routes (PayloadCMS admin UI)
- ❌ `/api/payload` routes (PayloadCMS API)
- ✅ Your main app continues working
- ✅ All other routes unaffected

---

## What to Keep

- ✅ All PayloadCMS code (collections, config)
- ✅ Documentation files
- ✅ Environment variables
- ✅ Database setup

**Why?** So you can easily re-enable when ready for subdomain setup.

---

## Re-enabling Later

When you're ready to set up subdomain:

1. Restore routes: `mv app/\(payload-disabled\) app/\(payload\)`
2. Or uncomment `withPayload` in `next.config.ts`
3. Set up subdomain deployment
4. Deploy PayloadCMS to subdomain
5. Share database between apps

---

**This is a clean way to pause PayloadCMS without losing any work.**
