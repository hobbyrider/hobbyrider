# Image Migration Guide

## Problem

If you created product listings locally without `BLOB_READ_WRITE_TOKEN` set, images were saved to your local filesystem (`public/uploads/`) with paths like `/uploads/filename.jpg`. These images don't work in production because:

1. Vercel doesn't persist the filesystem between deployments
2. The images are on your local machine, not accessible from production
3. The database has local paths that don't resolve in production

## Solution

Migrate local images to Vercel Blob storage. This will:
- Upload images from your local machine to Vercel Blob
- Update the database with new cloud URLs
- Make images work in production

---

## Step 1: Get Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Find `BLOB_READ_WRITE_TOKEN` or create it
5. Copy the token value

---

## Step 2: Set Up Environment

Add the token to your local `.env.local`:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
DATABASE_URL=your_production_database_url
```

**Important:** Use your **production** `DATABASE_URL` so the migration updates the production database.

---

## Step 3: Install tsx (if needed)

```bash
npm install -D tsx
```

---

## Step 4: Run Migration Scripts

### Migrate Product Images

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

This will:
- Find all `ProductImage` records with `/uploads/` paths
- Upload them to Vercel Blob
- Update the database with new URLs

### Migrate Thumbnails

```bash
npx tsx scripts/migrate-thumbnails-to-blob.ts
```

This will:
- Find all `Software.thumbnail` fields with `/uploads/` paths
- Upload them to Vercel Blob
- Update the database with new URLs

---

## Step 5: Verify

1. Check your production site - images should now load
2. Verify in database that URLs are now Vercel Blob URLs (start with `https://*.public.blob.vercel-storage.com`)

---

## Alternative: Manual Re-upload

If migration scripts don't work or you prefer manual control:

1. Go to your production site
2. Edit each product that has missing images
3. Re-upload the images through the production interface
4. Images will automatically go to Vercel Blob

---

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not set"
- Make sure you've added it to `.env.local`
- Restart your terminal/process after adding it

### "File not found"
- Make sure images exist in `public/uploads/` locally
- Check the file paths in the database match your local files

### "DATABASE_URL is not set"
- Add your production database URL to `.env.local`
- Make sure it's the production database, not local

### Images still not loading after migration
- Clear browser cache
- Check that URLs in database are Vercel Blob URLs (not `/uploads/`)
- Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel production environment

---

## Prevention

To avoid this issue in the future:

1. **Always set `BLOB_READ_WRITE_TOKEN` locally:**
   ```bash
   # Option 1: Use Vercel CLI (recommended)
   vercel dev
   
   # Option 2: Set manually in .env.local
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```

2. **Verify images use cloud storage:**
   - Check that uploaded image URLs start with `https://*.public.blob.vercel-storage.com`
   - Not `/uploads/` paths

---

## Summary

✅ **Quick Fix:**
1. Get `BLOB_READ_WRITE_TOKEN` from Vercel
2. Add to `.env.local` with production `DATABASE_URL`
3. Run migration scripts
4. Images will work in production!
