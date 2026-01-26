# Blog Integration Setup - Final Steps

## ✅ What's Already Done

1. ✅ Blog listing page created: `/app/blog/page.tsx`
2. ✅ Blog post detail page created: `/app/blog/[slug]/page.tsx`
3. ✅ Payload API helper functions: `/lib/payload.ts`
4. ✅ Sitemap updated to include blog posts
5. ✅ Environment variable added to `.env.local`

## 🔧 Final Steps to Connect

### Step 1: Add Environment Variable in Vercel (Hobbyrider Project)

Go to **Vercel Dashboard → `hobbyrider` project → Settings → Environment Variables**

Add:
```
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
```

**Important:** This must be set in the **Hobbyrider project** (not the Payload project), so your main site can fetch blog posts.

### Step 2: Add Blog Link to Navigation (Optional)

Add a "Blog" link to your site header so users can find it:

**File:** `app/components/site-header.tsx`

Add a blog link in the navigation section (wherever your other links are).

### Step 3: Deploy and Test

1. **Commit and push** any changes
2. **Redeploy** the Hobbyrider project in Vercel
3. **Visit** `https://hobbyrider.io/blog` to see your published posts

## 🧪 Testing

After deployment, test:

1. **Blog listing page:**
   ```
   https://hobbyrider.io/blog
   ```
   Should show your published post: "Why Software Builders Should Use Directories..."

2. **Individual post:**
   ```
   https://hobbyrider.io/blog/why-software-builders-should-use-directories-and-why-it-still-matters-in-2026
   ```
   Should show the full post content

3. **API connection:**
   ```bash
   curl "https://payload.hobbyrider.io/api/posts?where[_status][equals]=published"
   ```
   Should return JSON with your published posts

## 📝 Notes

- Posts are cached for 60 seconds (ISR)
- New posts will appear within 60 seconds after publishing
- The blog uses your typography components (no direct Tailwind text classes)
- Mobile-responsive by default

## 🐛 Troubleshooting

### Posts Not Appearing

1. Check `PAYLOAD_PUBLIC_SERVER_URL` is set in Vercel (Hobbyrider project)
2. Verify post status is "Published" in Payload admin
3. Check browser console for CORS errors
4. Verify Payload CORS allows `hobbyrider.io` (already configured)

### CORS Errors

If you see CORS errors, verify in Payload's `payload.config.ts`:
```typescript
cors: [
  'https://hobbyrider.io',
  'https://www.hobbyrider.io',
  'http://localhost:3000',
]
```

### Content Not Rendering

Lexical content rendering is not yet implemented. The post detail page shows a placeholder. To implement:
1. Install: `npm install @payloadcms/richtext-lexical`
2. Update `app/blog/[slug]/page.tsx` to render Lexical JSON
