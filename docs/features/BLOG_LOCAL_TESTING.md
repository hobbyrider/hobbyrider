# Blog Integration - Local Testing Guide

## ✅ Current Setup Status

### Files Created/Updated:
- ✅ `app/(main)/blog/page.tsx` - Blog listing page
- ✅ `app/(main)/blog/[slug]/page.tsx` - Individual post page
- ✅ `lib/payload.ts` - Payload API helper functions
- ✅ `app/components/site-header.tsx` - Blog link added to desktop nav
- ✅ `app/components/mobile-menu.tsx` - Blog link added to mobile menu
- ✅ `app/sitemap.ts` - Blog posts included in sitemap
- ✅ `.env.local` - `PAYLOAD_PUBLIC_SERVER_URL` set

### Route Structure:
```
app/
  (main)/
    blog/
      page.tsx          ← Blog listing at /blog
      [slug]/
        page.tsx        ← Individual posts at /blog/[slug]
    layout.tsx          ← Provides header/footer for blog pages
```

## 🧪 Local Testing Steps

### 1. Verify Environment Variable
```bash
# Check .env.local has the variable
grep PAYLOAD_PUBLIC_SERVER_URL .env.local
# Should show: PAYLOAD_PUBLIC_SERVER_URL="https://payload.hobbyrider.io"
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test Blog Pages

**Blog Listing:**
- Visit: `http://localhost:3000/blog`
- Should show: List of published posts from Payload
- Should have: Header with Blog link visible
- Should have: Footer at bottom

**Individual Post:**
- Visit: `http://localhost:3000/blog/why-software-builders-should-use-directories-and-why-it-still-matters-in-2026`
- Should show: Full post content
- Should have: "← Back to Blog" link
- Should have: Header and footer

### 4. Check Navigation

**Desktop:**
- Header should show: Pricing | Categories | **Blog** | Submit a product
- Blog link should be clickable and go to `/blog`

**Mobile:**
- Open hamburger menu
- Should see: Categories | **Blog** | Pricing
- Blog link should work

### 5. Test API Connection

If posts don't appear, check browser console for errors:

```bash
# Test API directly
curl "https://payload.hobbyrider.io/api/posts?where[_status][equals]=published&limit=1"
```

Should return JSON with your published posts.

## 🐛 Troubleshooting

### Blog page shows 404 locally

**Check:**
1. Pages are in `app/(main)/blog/` (not `app/blog/`)
2. Dev server is running: `npm run dev`
3. No build errors in terminal

**Fix:**
- Restart dev server: Stop and run `npm run dev` again
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Posts don't appear (empty page)

**Check:**
1. Environment variable is set: `PAYLOAD_PUBLIC_SERVER_URL` in `.env.local`
2. At least one post is published in Payload admin
3. Browser console for CORS errors

**Fix:**
- Verify Payload CORS allows `localhost:3000`
- Check Payload admin: Post status is "Published" (not "Draft")
- Restart dev server after changing `.env.local`

### Blog link not in navigation

**Check:**
1. `app/components/site-header.tsx` has Blog link
2. `app/components/mobile-menu.tsx` has Blog link
3. Browser cache - hard refresh (Cmd+Shift+R)

**Fix:**
- Restart dev server
- Clear browser cache

### CORS errors in console

**Fix:**
- Verify Payload `payload.config.ts` has:
  ```typescript
  cors: [
    'https://hobbyrider.io',
    'http://localhost:3000', // For local dev
  ]
  ```
- Redeploy Payload after CORS changes

## ✅ Ready for Production

Once local testing passes:

1. **Add environment variable in Vercel:**
   - Go to Vercel → `hobbyrider` project → Settings → Environment Variables
   - Add: `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io`
   - Set for "All Environments"

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add blog integration with Payload CMS"
   git push
   ```

3. **Deploy:**
   - Vercel will auto-deploy
   - After deployment, visit `https://hobbyrider.io/blog`

## 📝 Notes

- Posts are cached for 60 seconds (ISR)
- New posts appear within 60 seconds after publishing
- Lexical content rendering not yet implemented (shows placeholder)
