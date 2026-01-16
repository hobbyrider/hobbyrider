# Quick Fix: Missing Images in Production

## The Problem

Images uploaded locally were saved to `public/uploads/` with paths like `/uploads/filename.jpg`. These don't work in production because the files aren't on Vercel's servers.

## Quick Solution (5 minutes)

### Step 1: Get Vercel Blob Token
1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Copy `BLOB_READ_WRITE_TOKEN`

### Step 2: Add to `.env.local`
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
DATABASE_URL=your_production_database_url
```

### Step 3: Run Migration
```bash
# Migrate product images
npx tsx scripts/migrate-images-to-blob.ts

# Migrate thumbnails
npx tsx scripts/migrate-thumbnails-to-blob.ts
```

### Step 4: Done! ✅
Images will now work in production.

---

## Alternative: Manual Re-upload

If you prefer, just edit each product in production and re-upload the images. They'll automatically go to Vercel Blob.

---

**See `IMAGE_MIGRATION_GUIDE.md` for detailed instructions.**
