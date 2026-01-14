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

### 1. File Uploads (CRITICAL)

**Current Issue:** The app saves uploaded images to `public/uploads/`, which won't work on Vercel (read-only filesystem).

**Solutions:**
- **Vercel Blob** (Recommended for Vercel)
  - Install: `npm install @vercel/blob`
  - Update `app/api/upload/route.ts` to use Vercel Blob
- **Cloudinary** (Popular alternative)
  - Free tier available
  - Install: `npm install cloudinary`
- **AWS S3** (Enterprise option)
  - More setup required

### 2. Database

- Ensure your `DATABASE_URL` is a production database
- Prisma will automatically run migrations on Vercel (via `postinstall` script)

### 3. Environment Variables

Set these in Vercel dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
ADMIN_PASSWORD=your_admin_password (optional)
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

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
- [ ] File uploads configured (Vercel Blob/Cloudinary/S3)
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
- This is expected - need to migrate to cloud storage
- See "File Uploads" section above

**Database connection errors:**
- Verify `DATABASE_URL` is set correctly
- Check database allows connections from Vercel IPs
- For Prisma Cloud, ensure connection pooling is enabled
