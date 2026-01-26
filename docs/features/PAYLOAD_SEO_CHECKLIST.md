# Payload CMS SEO Configuration Checklist

## ✅ Current Status

Based on your Vercel configuration, here's what you have set up:

### Environment Variables in Vercel (Payload Project)
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://payload.hobbyrider.io`
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` = `https://payload.hobbyrider.io`

### Domain Configuration
- ✅ `payload.hobbyrider.io` set as Production domain
- ✅ 308 Permanent Redirect from Vercel subdomain to custom domain

### CORS Configuration
- ✅ CORS configured to allow requests from `hobbyrider.io`

## ⚠️ Potential Issue

**Payload's code uses `NEXT_PUBLIC_SERVER_URL`**, but you have `NEXT_PUBLIC_SITE_URL` set.

The `getServerSideURL()` function in Payload checks for:
1. `process.env.NEXT_PUBLIC_SERVER_URL` (first priority)
2. Falls back to `VERCEL_PROJECT_PRODUCTION_URL` if not set

## 🔧 Recommended Fix

**Add this environment variable in Vercel (Payload project):**

```
NEXT_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
```

This ensures Payload uses the correct URL for:
- Canonical URLs in meta tags
- Open Graph images
- SEO previews
- Internal links

## 📋 Complete SEO Checklist

### In Vercel (Payload Project) - Environment Variables:
- [x] `NEXT_PUBLIC_SITE_URL` = `https://payload.hobbyrider.io`
- [x] `PAYLOAD_PUBLIC_SERVER_URL` = `https://payload.hobbyrider.io`
- [ ] `NEXT_PUBLIC_SERVER_URL` = `https://payload.hobbyrider.io` ⚠️ **ADD THIS**

### Domain Configuration:
- [x] Custom domain `payload.hobbyrider.io` configured
- [x] Production domain set correctly
- [x] 308 redirect from Vercel subdomain

### Code Configuration:
- [x] CORS allows `hobbyrider.io`
- [x] `getServerSideURL()` will use correct URL (once `NEXT_PUBLIC_SERVER_URL` is added)

## 🧪 How to Verify After Deployment

1. **Check meta tags:**
   ```bash
   curl -s https://payload.hobbyrider.io | grep -i "canonical\|og:url"
   ```
   Should show `https://payload.hobbyrider.io` (not Vercel URL)

2. **Check Open Graph preview:**
   - Use https://www.opengraph.xyz/ or similar tool
   - Enter `https://payload.hobbyrider.io`
   - Verify images and URLs use the custom domain

3. **Check source code:**
   - View page source of any Payload page
   - Search for `vercel.app` - should not appear in canonical URLs

## 📝 Notes

- The 50-minute deployment is normal for first-time builds or large changes
- After adding `NEXT_PUBLIC_SERVER_URL`, redeploy to apply changes
- All three variables (`NEXT_PUBLIC_SITE_URL`, `PAYLOAD_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SERVER_URL`) can safely be set to the same value
