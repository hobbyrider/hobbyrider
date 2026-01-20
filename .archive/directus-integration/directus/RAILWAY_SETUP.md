# Deploy Directus on Railway - Step by Step Guide

This guide will help you deploy Directus on Railway for **~$5-10/month** (vs $99/month for Directus Cloud).

## Prerequisites

- GitHub account
- Railway account (free signup)
- Your existing PostgreSQL database credentials (from Prisma/Vercel)

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended - easiest)
4. Authorize Railway to access your GitHub account
5. You'll see your Railway dashboard

**Note:** Railway gives you **$5/month free credit**. After that, it's pay-as-you-go (typically $5-10/month for Directus).

## Step 2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `hobbyrider` repository
4. Railway will ask: **"Configure Root Directory"**
   - Enter: `directus`
   - This tells Railway to deploy from the `directus/` folder
5. Click **"Deploy Now"**

**IMPORTANT - If Railway tries to build as Node.js:**

If Railway detects Node.js and tries to run `npm build` (you'll see "Railpack detected"), you need to configure Docker:

1. **Wait for the first deployment to start** (it will likely fail)
2. Click on your service in Railway
3. Go to **"Settings"** tab
4. Scroll to **"Build"** section
5. Change **"Build Command"** to: (leave empty)
6. Set **"Dockerfile Path"** to: `Dockerfile`
7. Save changes
8. Railway will automatically redeploy using Docker

**Alternative - Force Docker from the start:**

1. After selecting the repo, click **"Advanced"** or **"Settings"** before deploying
2. Look for **"Build Type"** or **"Deploy Method"**
3. Select **"Dockerfile"**
4. Set Root Directory to: `directus`

The `railway.json` file in the `directus/` directory should tell Railway to use Docker, but sometimes you need to manually configure it.

Railway will start building your Directus project using Docker.

## Step 3: Set Environment Variables

Once Railway starts building, you need to add environment variables:

1. Click on your project in Railway
2. Click on the **Directus service** (the one that's building)
3. Click the **"Variables"** tab
4. Add these environment variables:

### Database Configuration

**Option A: Use Your Existing Prisma Database (Recommended)**

Since you already have a PostgreSQL database, use that:

```bash
DB_CLIENT=pg
DB_HOST=db.prisma.io
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

**To find your database credentials:**
- Go to your Vercel project → Settings → Environment Variables
- Look for `DATABASE_URL`
- It should look like: `postgres://user:password@db.prisma.io:5432/postgres?sslmode=require`
- Extract:
  - `DB_HOST` = `db.prisma.io`
  - `DB_PORT` = `5432`
  - `DB_DATABASE` = `postgres` (or whatever is after the port)
  - `DB_USER` = everything before `:` in the user:password part
  - `DB_PASSWORD` = everything after `:` and before `@` in the user:password part

**Option B: Create New PostgreSQL on Railway**

1. In Railway, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically add these variables (you don't need to set them manually):
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
3. Map them to Directus format in your Directus service:
   ```bash
   DB_CLIENT=pg
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_DATABASE=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

### Directus Configuration

Add these required variables:

```bash
# Directus secret keys (generate random strings)
KEY=generate-a-random-string-here-at-least-32-chars
SECRET=generate-another-random-string-here-at-least-32-chars
```

**To generate secure random strings:**
```bash
# On Mac/Linux:
openssl rand -hex 32

# Or use an online generator:
# https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new
```

```bash
# Admin user credentials (created on first run)
ADMIN_EMAIL=admin@hobbyrider.io
ADMIN_PASSWORD=your-secure-password-here-change-this
```

**Important:** Use a strong password for `ADMIN_PASSWORD`!

### Public URL Configuration

```bash
# CORS settings (allow your Next.js app to access Directus)
CORS_ENABLED=true
CORS_ORIGIN=https://hobbyrider.io,https://www.hobbyrider.io,https://hobbyrider.vercel.app
```

### Optional: Additional Settings

```bash
# Storage location (for file uploads)
STORAGE_LOCATIONS=local

# Public URL (Railway will set this automatically, but you can override)
PUBLIC_URL=https://your-service-name.up.railway.app
```

## Step 4: Wait for Deployment

1. Railway will automatically:
   - Install dependencies
   - Build the Docker container
   - Start Directus

2. Watch the **"Deployments"** tab to see the build progress

3. Deployment usually takes **2-5 minutes**

4. Once deployed, Railway will show a **"Public URL"** (e.g., `https://hobbyrider-directus.up.railway.app`)

## Step 5: Access Directus Admin

1. Click on your Directus service in Railway
2. Find the **"Public URL"** (e.g., `https://your-service.up.railway.app`)
3. Click the URL to open it in your browser
4. You should see the Directus admin login page
5. Log in with:
   - **Email:** The `ADMIN_EMAIL` you set in Step 3
   - **Password:** The `ADMIN_PASSWORD` you set in Step 3

**First login may take 10-30 seconds** as Directus initializes the database.

## Step 6: Create Collections

Once logged in, create your content collections:

### Create "Blog Posts" Collection

1. Click **"Content"** in the left sidebar
2. Click **"Create Collection"**
3. Fill in:
   - **Collection Name:** `blog_posts`
   - **Icon:** Choose an icon (e.g., 📝)
   - Click **"Continue"**

4. Add fields to the collection:

   - **Title** (String)
     - Key: `title`
     - Required: ✅
   
   - **Slug** (String)
     - Key: `slug`
     - Required: ✅
     - Unique: ✅
   
   - **Excerpt** (Text)
     - Key: `excerpt`
   
   - **Content** (WYSIWYG)
     - Key: `content`
     - Type: WYSIWYG (Rich Text)
   
   - **Featured Image** (File)
     - Key: `featured_image`
     - Type: File
   
   - **Author** (User)
     - Key: `author`
     - Type: User
   
   - **Published At** (DateTime)
     - Key: `published_at`
     - Type: DateTime
   
   - **Status** (String)
     - Key: `status`
     - Type: String
     - Interface: Dropdown
     - Options:
       - `draft`
       - `published`
       - `archived`
   
   - **Tags** (JSON)
     - Key: `tags`
     - Type: JSON
     - Interface: Tags
   
   - **SEO Title** (String)
     - Key: `seo_title`
   
   - **SEO Description** (Text)
     - Key: `seo_description`
   
   - **SEO Image** (File)
     - Key: `seo_image`
     - Type: File

5. Click **"Save"**

### Create "Pages" Collection

1. Click **"Create Collection"**
2. Collection Name: `pages`
3. Add fields:
   - **Title** (String, required)
   - **Slug** (String, required, unique)
   - **Content** (WYSIWYG)
   - **Template** (String, dropdown: default/landing/about)
   - **Published** (Boolean)
   - **SEO Title** (String)
   - **SEO Description** (Text)
4. Click **"Save"**

## Step 7: Set DIRECTUS_URL in Vercel

Now connect your Next.js app to Directus:

1. Go to your **Vercel** project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Key:** `DIRECTUS_URL`
   - **Value:** Your Railway public URL (e.g., `https://hobbyrider-directus.up.railway.app`)
   - **Environment:** Production, Preview, Development (select all)
4. Click **"Save"**
5. **Redeploy** your Vercel app (go to Deployments → Click "..." → Redeploy)

## Step 8: Optional - Set DIRECTUS_TOKEN

For authenticated API requests (recommended for production):

1. In Directus admin, go to **Settings** → **Access Tokens**
2. Click **"Create Token"**
3. Set:
   - **Name:** `Next.js App`
   - **Duration:** `No Expiry` (or set expiration date)
   - **Permissions:** `Admin` (or customize)
4. Copy the token
5. Add to Vercel environment variables:
   - **Key:** `DIRECTUS_TOKEN`
   - **Value:** The token you copied
6. Redeploy your Vercel app

## Step 9: Test the Integration

Test that Directus is working with your Next.js app:

1. Create a test blog post in Directus admin
2. Visit your Next.js app at `/api/blog` to see if posts are fetched
3. Or use the helper functions:
   ```typescript
   import { directus } from '@/lib/directus'
   
   const posts = await directus.getBlogPosts({ status: 'published' })
   ```

## Troubleshooting

### Directus won't start / shows error

1. Check Railway **Logs** tab for errors
2. Verify all environment variables are set correctly
3. Make sure `DB_HOST`, `DB_USER`, `DB_PASSWORD` are correct
4. Check that `KEY` and `SECRET` are set (at least 32 characters each)

### Can't access admin URL

1. Make sure Railway deployment completed successfully
2. Check that `PUBLIC_URL` matches your Railway public URL
3. Try clearing browser cache
4. Wait 1-2 minutes for Directus to fully initialize

### Database connection errors

1. Verify database credentials in Railway Variables
2. If using Prisma database, make sure connection string is correct
3. Check that database is accessible from Railway's network
4. Try creating a new PostgreSQL database on Railway instead

### CORS errors in Next.js

1. Make sure `CORS_ORIGIN` includes your Vercel domain
2. Check that `DIRECTUS_URL` in Vercel matches your Railway URL
3. Restart both services

## Cost Estimate

**Railway Pricing:**
- **Free:** $5/month credit included
- **After credit:** ~$0.01-0.02 per hour of compute
- **Typical Directus cost:** $5-10/month
- **Database (if using Railway):** ~$5/month additional

**Total:** ~$5-15/month (much cheaper than $99/month for Directus Cloud!)

## Next Steps

1. ✅ Directus is deployed on Railway
2. ✅ Collections are created
3. ✅ `DIRECTUS_URL` is set in Vercel
4. ✅ Start creating content in Directus admin
5. ✅ Fetch content in your Next.js app using `lib/directus.ts`

See `directus/SETUP.md` for more details on collections and usage.
