# Production Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your repository

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string (REQUIRED)
   - `NEXTAUTH_SECRET` - Secret key for NextAuth (REQUIRED - generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`) (REQUIRED)
   - `ADMIN_PASSWORD` - Password for admin delete functionality (optional)

4. **Deploy**
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Important Production Considerations

### 1. File Uploads ✅

**Status:** ✅ **FIXED** - Now using Vercel Blob for cloud storage

**Setup:**
- **Production (Vercel):** Vercel Blob is automatically configured. No additional setup needed!
- **Local Development:** 
  - Option 1: Use Vercel CLI (recommended)
    ```bash
    vercel dev
    ```
    This automatically provides `BLOB_READ_WRITE_TOKEN` for local development.
  
  - Option 2: Set token manually
    ```bash
    # Get token from Vercel dashboard → Settings → Environment Variables
    # Add to .env.local:
    BLOB_READ_WRITE_TOKEN=your_token_here
    ```

**How it works:**
- Images are uploaded to Vercel Blob storage
- URLs are returned as public CDN links
- Works seamlessly in both local and production environments

### 2. Database

- Ensure your `DATABASE_URL` is a production database
- Prisma will automatically run migrations on Vercel (via `postinstall` script)

### 3. Environment Variables

Set these in Vercel dashboard → Project Settings → Environment Variables:

**Required:**
```
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
```

**OAuth & Email (Optional but recommended):**
```
# Google OAuth (for "Sign in with Google")
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email/Magic Link (choose one option):
# Option 1: Resend (Recommended - easier setup)
RESEND_API_KEY=re_your_resend_api_key
SMTP_FROM=noreply@yourdomain.com

# Option 2: SMTP (Alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

**Optional:**
```
ADMIN_PASSWORD=your_admin_password
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Setup Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://hobbyrider.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret to environment variables

**Setup Resend (for Magic Link):**
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (or use their test domain for development)
3. Get your API key from dashboard
4. Add `RESEND_API_KEY` to environment variables
5. Set `SMTP_FROM` to your verified email address

### 4. Build Settings

Vercel auto-detects Next.js, but verify:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 5. Custom Domain (Optional)

After deployment:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database migrations run (automatic via postinstall)
- [x] File uploads configured (Vercel Blob) ✅
- [ ] Test product submission
- [ ] Test comments
- [ ] Test search functionality
- [ ] Verify images load correctly

## Troubleshooting

**Build fails:**
- Check environment variables are set
- Verify `DATABASE_URL` is correct
- Check build logs in Vercel dashboard

**File uploads don't work:**
- ✅ **Fixed!** Now using Vercel Blob
- For local dev: Run `vercel dev` or set `BLOB_READ_WRITE_TOKEN` in `.env.local`
- In production: Automatically configured on Vercel

**Database connection errors:**
- Verify `DATABASE_URL` is set correctly
- Check database allows connections from Vercel IPs
- For Prisma Cloud, ensure connection pooling is enabled
