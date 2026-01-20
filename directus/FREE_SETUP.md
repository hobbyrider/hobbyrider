# Free Directus Setup Guide

**Directus is 100% free and open-source!** The only cost is hosting infrastructure.

## 🆓 Best Free Option: Railway (Recommended)

Railway offers $5/month free credit, then pay-as-you-go pricing. For Directus, this typically costs **$5-10/month** (much cheaper than Directus Cloud's $99/month).

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)
3. You'll get $5/month free credit

### Step 2: Deploy Directus

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `hobbyrider` repo
4. Set **Root Directory:** `directus`
5. Railway will auto-detect the Docker setup

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates a PostgreSQL database automatically

**OR** use your existing Prisma database:
- Go to **"Variables"** tab
- Add these environment variables (from your Vercel project):
  ```
  DB_HOST=db.prisma.io
  DB_PORT=5432
  DB_DATABASE=postgres
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  ```

### Step 4: Set Environment Variables

In Railway, go to **"Variables"** tab and add:

```bash
# Database (if using Railway's PostgreSQL, these are auto-set)
DB_CLIENT=pg
# DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD are auto-set if you added Railway's PostgreSQL
# OR use your existing Prisma database credentials above

# Directus configuration
KEY=your-super-secret-key-change-me-to-random-string
SECRET=your-super-secret-secret-change-me-to-random-string

# Admin user (created on first run)
ADMIN_EMAIL=admin@hobbyrider.io
ADMIN_PASSWORD=your-secure-password-here

# Public URL (Railway provides this after deploy)
PUBLIC_URL=https://your-project.up.railway.app

# CORS for Next.js
CORS_ENABLED=true
CORS_ORIGIN=https://hobbyrider.io,https://www.hobbyrider.io
```

### Step 5: Deploy

1. Railway automatically deploys when you connect the repo
2. Wait for deployment to complete (~2-3 minutes)
3. Copy the **"Public URL"** from Railway (e.g., `https://hobbyrider-directus.up.railway.app`)

### Step 6: Access Directus Admin

1. Visit your Railway public URL
2. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Create your collections (blog_posts, pages)

### Step 7: Set DIRECTUS_URL in Vercel

In your **hobbyrider** Vercel project:
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   DIRECTUS_URL=https://your-project.up.railway.app
   ```
3. Redeploy your Next.js app

**That's it!** Total cost: **~$5-10/month** (vs $99/month for Directus Cloud)

---

## 🆓 Alternative: Render (Free Tier)

Render has a free tier with limitations (may sleep after inactivity).

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (free)

### Step 2: Create New Web Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `hobbyrider-directus`
   - **Root Directory:** `directus`
   - **Environment:** `Docker`
   - **Build Command:** (leave empty, uses Docker)
   - **Start Command:** (leave empty, uses Docker)

### Step 3: Add PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Render creates a database automatically
3. Note the database connection details

**OR** use your existing Prisma database by setting environment variables.

### Step 4: Set Environment Variables

In Render's **Environment** section, add all variables from Step 4 above.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Get your public URL (e.g., `https://hobbyrider-directus.onrender.com`)

**Cost:** Free (may have limitations like sleeping after inactivity)

---

## 🆓 Alternative: Fly.io (Generous Free Tier)

Fly.io offers a generous free tier that should cover Directus usage.

### Step 1: Install Fly.io CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login

```bash
fly auth login
```

### Step 3: Launch Directus

```bash
cd directus
fly launch
```

Follow the prompts and set environment variables when asked.

---

## 💰 Cost Comparison

| Option | Monthly Cost | Notes |
|--------|--------------|-------|
| **Railway** | $5-10/month | Best free option, $5/month credit |
| **Render** | Free | May sleep after inactivity |
| **Fly.io** | Free | Generous free tier |
| **Directus Cloud** | $99/month | Easiest but paid |
| **Your own server** | Free | If you already have one |

**Recommendation:** Start with **Railway** - it's cheap, reliable, and doesn't sleep.

---

## Next Steps

After deploying Directus (any option above):

1. ✅ Set `DIRECTUS_URL` in Vercel environment variables
2. ✅ Access Directus admin and create collections (blog_posts, pages)
3. ✅ Start creating content
4. ✅ Use in your Next.js app via `lib/directus.ts`

See `directus/SETUP.md` for detailed collection setup instructions.
