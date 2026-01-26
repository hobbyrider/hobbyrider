# Payload SEO Fix - Current Status

## 🔍 Current Issue

The deployed site is still showing Vercel URLs in meta tags:
- `og:url` = `https://payload-website-starter-gamma-sepia.vercel.app`
- `og:image` = `https://payload-website-starter-gamma-sepia.vercel.app/website-template-OG.webp`

This is because the **current deployment started before** `NEXT_PUBLIC_SERVER_URL` was added to Vercel.

## ✅ What You've Done

1. ✅ Added `NEXT_PUBLIC_SERVER_URL` to local `.env.local`
2. ✅ Domain configured correctly (`payload.hobbyrider.io`)
3. ✅ 308 redirect set up
4. ✅ CORS configured

## ⚠️ What's Missing

**`NEXT_PUBLIC_SERVER_URL` must be added to Vercel Environment Variables**

The current 50-minute deployment is using the old build that doesn't have this variable.

## 🔧 Fix Steps

### 1. Add Environment Variable in Vercel

Go to: **Vercel Dashboard → `payload-website-starter` project → Settings → Environment Variables**

Add:
```
NEXT_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
```

**Important:** Make sure it's set for **"All Environments"** (Production, Preview, Development)

### 2. Trigger New Deployment

After adding the variable, you have two options:

**Option A: Wait for current deployment to finish, then:**
- Make a small change (like adding a comment) and push to trigger a new build
- OR use "Redeploy" button in Vercel

**Option B: Cancel current deployment and redeploy:**
- Cancel the current 50-minute deployment
- Add the environment variable
- Redeploy (will use the new variable)

### 3. Verify After Deployment

Once the new deployment finishes, check:

```bash
curl -s https://payload.hobbyrider.io | grep -E "og:url|og:image"
```

Should show:
```html
<meta property="og:url" content="https://payload.hobbyrider.io"/>
<meta property="og:image" content="https://payload.hobbyrider.io/website-template-OG.webp"/>
```

## 📋 Complete Environment Variables Checklist

In Vercel (`payload-website-starter` project), ensure you have:

- [x] `NEXT_PUBLIC_SITE_URL` = `https://payload.hobbyrider.io`
- [x] `PAYLOAD_PUBLIC_SERVER_URL` = `https://payload.hobbyrider.io`
- [ ] `NEXT_PUBLIC_SERVER_URL` = `https://payload.hobbyrider.io` ⚠️ **ADD THIS NOW**

## 🎯 Why This Matters

`NEXT_PUBLIC_SERVER_URL` is used by:
- `getServerSideURL()` function (used throughout Payload)
- `metadataBase` in layout.tsx
- Open Graph image URLs
- Canonical URL generation
- SEO meta tags

Without it, Payload falls back to `VERCEL_PROJECT_PRODUCTION_URL`, which is the Vercel subdomain.

## ⏱️ Timeline

1. **Now**: Add `NEXT_PUBLIC_SERVER_URL` to Vercel
2. **After current deployment finishes**: Trigger a new deployment
3. **After new deployment**: Meta tags will use `payload.hobbyrider.io`

The 50-minute deployment time is normal for first-time builds or large changes. Once it finishes and you add the variable, the next deployment will be faster and will use the correct URLs.
