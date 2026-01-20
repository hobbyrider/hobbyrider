# Directus Setup Guide

## ⚠️ Important: Directus is FREE to Self-Host!

Directus itself is **100% open-source and free**. Directus Cloud (their hosted service) costs $99/month, but you can self-host Directus for free. You'll only pay for hosting infrastructure (or use free tiers).

## Option 1: Directus Cloud (Paid - Easiest)

### Step 1: Create Directus Cloud Project

1. Go to [directus.cloud](https://directus.cloud)
2. Sign up / Log in
3. Click "Create Project"
4. Choose:
   - **Name:** `hobbyrider-cms`
   - **Database:** External PostgreSQL (connect to your existing database)
   - **Region:** Choose closest to you
5. Enter your PostgreSQL connection details:
   - Host: `db.prisma.io` (or your DB host)
   - Port: `5432`
   - Database: `postgres` (or your DB name)
   - User: Your database user
   - Password: Your database password

### Step 2: Configure Collections

1. After project is created, access Directus admin
2. Create collections:
   - **Blog Posts** (`blog_posts`)
   - **Pages** (`pages`)
   - **Media** (uses built-in `directus_files`)

### Step 3: Set Environment Variables in Vercel

For your hobbyrider project, add:
```
DIRECTUS_URL=https://your-project.directus.app
DIRECTUS_TOKEN=your-static-token (optional, or use public API)
```

### Step 4: Configure Collections

In Directus admin, create the following collections with fields:

**Blog Posts** (`blog_posts`):
- `id` (uuid, primary key)
- `title` (string, required)
- `slug` (string, required, unique)
- `excerpt` (text)
- `content` (wysiwyg/rich text)
- `featured_image` (file - relation to `directus_files`)
- `author` (user - relation to `directus_users`)
- `published_at` (datetime)
- `status` (string, options: draft/published/archived)
- `tags` (array of strings)
- `seo_title` (string)
- `seo_description` (text)
- `seo_image` (file)
- `date_created` (timestamp)
- `date_updated` (timestamp)

**Pages** (`pages`):
- `id` (uuid, primary key)
- `title` (string, required)
- `slug` (string, required, unique)
- `content` (wysiwyg/rich text)
- `template` (string, options: default/landing/about)
- `published` (boolean)
- `seo_title` (string)
- `seo_description` (text)
- `date_created` (timestamp)
- `date_updated` (timestamp)

**Media** (uses built-in `directus_files`):
- Already configured by Directus
- Supports images, videos, documents
- Automatic thumbnails and transformations

---

## Option 2: Self-Hosted with Docker (FREE - Recommended)

This is the **free option** - Directus software is free, you just need to host it.

### Step 1: Set Up Environment Variables

Create `.env` file in `directus/` directory:
```bash
DB_HOST=db.prisma.io
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=your_db_user
DB_PASSWORD=your_db_password

DIRECTUS_KEY=your-super-secret-key
DIRECTUS_SECRET=your-super-secret-secret

ADMIN_EMAIL=admin@hobbyrider.io
ADMIN_PASSWORD=your-secure-password

PUBLIC_URL=https://directus.hobbyrider.io
CORS_ORIGIN=https://hobbyrider.io,https://payload.hobbyrider.io
```

### Step 2: Start Directus

```bash
cd directus
docker-compose up -d
```

### Step 3: Access Admin

1. Open `http://localhost:8055` (or your PUBLIC_URL)
2. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Configure collections (same as Option 1, Step 4)

### Step 4: Deploy Directus

**On Railway:**
1. Connect GitHub repo
2. Set Root Directory: `directus`
3. Add environment variables
4. Deploy

**On Render:**
1. Create new Web Service
2. Use Docker Compose
3. Add environment variables
4. Deploy

**On Fly.io:**
1. Create Dockerfile for Directus
2. Deploy using `fly launch`
3. Set environment variables
4. Deploy

---

## Option 3: Railway/Render (Serverless-Friendly - FREE/Cheap)

**Best free/cheap option for production!**

### Railway Setup

1. Go to [Railway](https://railway.app)
2. Create new project
3. Deploy from GitHub (select `directus/` directory)
4. Add PostgreSQL service (or connect to existing)
5. Set environment variables
6. Deploy

### Render Setup

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set Root Directory: `directus`
5. Use Docker Compose
6. Add environment variables
7. Deploy

---

## Next.js Integration

After Directus is set up:

1. **Set environment variables in Vercel:**
   ```
   DIRECTUS_URL=https://your-directus-instance.com
   DIRECTUS_TOKEN=your-static-token (optional)
   ```

2. **Use Directus SDK in your Next.js app:**
   ```typescript
   import { directus } from '@/lib/directus'
   
   const posts = await directus.getBlogPosts({ status: 'published' })
   ```

3. **Create API routes or server components:**
   - Fetch content from Directus
   - Render in Next.js pages
   - Use ISR for caching

See `lib/directus.ts` for SDK setup and helper functions.

---

## Recommended Approach

**For Free (Recommended):** Self-host on Railway/Render/Fly.io
- ✅ Directus software is 100% free (open-source)
- ✅ Railway: $5/month free credit, then ~$5-10/month
- ✅ Render: Free tier available (with limitations)
- ✅ Fly.io: Generous free tier
- ✅ Fast setup (~10 minutes)
- ✅ Use existing PostgreSQL database

**For Easiest (Paid):** Use Directus Cloud
- Fastest setup
- No infrastructure to manage
- $99/month after 14-day free trial
- Can always migrate to self-hosted later

**For Full Control:** Self-host with Docker on your own server
- Use existing PostgreSQL database
- Full control over infrastructure
- Free if you already have a server
