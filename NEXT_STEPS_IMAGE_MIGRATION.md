# Next Steps: Migrate Images to Production

## Step 1: Verify Setup ✅

Make sure your `.env.local` has both:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxx"
DATABASE_URL="your_production_database_url"
```

**Important:** Use your **production** `DATABASE_URL` so the migration updates the production database.

---

## Step 2: Run Migration Scripts

### Migrate Product Images (Gallery Images)

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

This will:
- Find all product images with `/uploads/` paths
- Upload them from your local `public/uploads/` folder to Vercel Blob
- Update the production database with new cloud URLs

### Migrate Thumbnails

```bash
npx tsx scripts/migrate-thumbnails-to-blob.ts
```

This will:
- Find all product thumbnails with `/uploads/` paths
- Upload them to Vercel Blob
- Update the production database

---

## Step 3: Verify Migration

After running the scripts:

1. **Check the output:**
   - You should see "✅ Successfully migrated: X" messages
   - Any errors will be listed

2. **Check Vercel Blob:**
   - Go to Vercel Dashboard → Storage → hobbyrider-blob
   - You should see uploaded images in the Browser section

3. **Check Production Site:**
   - Visit your production site
   - Go to a product page that had missing images
   - Images should now load! 🎉

---

## Step 4: Test New Uploads

1. **Upload a new image** in production (or locally if you have the token)
2. **Verify it goes to Vercel Blob:**
   - Check the URL - it should start with `https://*.public.blob.vercel-storage.com`
   - Not `/uploads/`

---

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not set"
- Make sure it's in `.env.local`
- Restart your terminal after adding it
- Verify: `cat .env.local | grep BLOB_READ_WRITE_TOKEN`

### "File not found"
- Make sure images exist in `public/uploads/` locally
- Check the file paths match what's in the database

### "DATABASE_URL is not set"
- Add your production database URL to `.env.local`
- Make sure it's the production URL, not local

### Images still not loading after migration
- Clear browser cache
- Check that URLs in database are Vercel Blob URLs (not `/uploads/`)
- Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel production environment

---

## What to Expect

**Successful migration output:**
```
🔍 Finding images with local paths...
📦 Found 5 local image(s) to migrate

📤 Migrating: /uploads/image1.jpg
   Product: My Product (abc123)
   ✅ Migrated to: https://xxx.public.blob.vercel-storage.com/...

📊 Migration Summary
✅ Successfully migrated: 5
❌ Failed: 0
📦 Total: 5

✅ Migration complete! Images are now stored in Vercel Blob.
```

---

## Ready? Let's Go! 🚀

Run the first migration script:

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

Then run the second one:

```bash
npx tsx scripts/migrate-thumbnails-to-blob.ts
```

After that, your images should work in production!
