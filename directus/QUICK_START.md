# Directus Quick Start

## ⚠️ Directus is FREE to Self-Host!

Directus itself is **100% open-source and free**. Directus Cloud costs $99/month, but you can self-host for **free** (just pay for hosting, or use free tiers).

**For a free setup, see `FREE_SETUP.md` (recommended - Railway is ~$5-10/month).**

## Option 1: Directus Cloud (Paid - Fastest)

### Step 1: Create Directus Cloud Project

1. Go to [directus.cloud](https://directus.cloud) and sign up
2. Click **"Create Project"**
3. Choose **"External Database"** (use your existing PostgreSQL)
4. Enter your database connection details:
   - **Host:** `db.prisma.io`
   - **Port:** `5432`
   - **Database:** `postgres` (or your DB name)
   - **User:** Your database user
   - **Password:** Your database password
5. Wait for project to be created (~2 minutes)

### Step 2: Create Collections in Directus

1. Access your Directus admin at the URL provided
2. Log in with the admin credentials
3. Create **Blog Posts** collection:
   - Click **"Create Collection"**
   - Name: `blog_posts`
   - Add fields:
     - `title` (String, required)
     - `slug` (String, required, unique)
     - `excerpt` (Text)
     - `content` (WYSIWYG)
     - `featured_image` (File)
     - `author` (User)
     - `published_at` (DateTime)
     - `status` (String, dropdown: draft/published/archived)
     - `tags` (JSON array)
     - `seo_title` (String)
     - `seo_description` (Text)
     - `seo_image` (File)

4. Create **Pages** collection:
   - Name: `pages`
   - Add fields:
     - `title` (String, required)
     - `slug` (String, required, unique)
     - `content` (WYSIWYG)
     - `template` (String, dropdown: default/landing/about)
     - `published` (Boolean)
     - `seo_title` (String)
     - `seo_description` (Text)

### Step 3: Set Environment Variables in Vercel

In your **hobbyrider** Vercel project, add:
```
DIRECTUS_URL=https://your-project.directus.app
DIRECTUS_TOKEN=your-static-token (optional - for authenticated requests)
```

### Step 4: Use in Your Next.js App

```typescript
import { directus } from '@/lib/directus'

// In a server component or API route
const posts = await directus.getBlogPosts({ status: 'published' })
```

That's it! Directus is now integrated and ready to use.

---

## Self-Hosted Option (Full Control)

If you prefer self-hosting:

1. **Use Docker Compose** (see `directus/docker-compose.yml`)
2. **Or deploy to Railway/Render** (see `directus/SETUP.md`)

---

## Next Steps

1. ✅ Set up Directus (Cloud or self-hosted)
2. ✅ Create collections (blog_posts, pages)
3. ✅ Set DIRECTUS_URL in Vercel
4. ✅ Start creating content in Directus admin
5. ✅ Fetch content in your Next.js app using `lib/directus.ts`

See `directus/SETUP.md` for detailed instructions.
