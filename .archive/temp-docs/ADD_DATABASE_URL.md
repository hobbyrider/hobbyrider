# Add DATABASE_URL to .env.local

## The Issue

The migration script needs `DATABASE_URL` to connect to your production database. You have `BLOB_READ_WRITE_TOKEN` but missing `DATABASE_URL`.

## Quick Fix

### Step 1: Get Production DATABASE_URL

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Select your project
   - Go to **Settings → Environment Variables**

2. **Find DATABASE_URL:**
   - Look for `DATABASE_URL` in the list
   - Click the eye icon to reveal the value
   - Copy the entire connection string

### Step 2: Add to .env.local

Open `.env.local` and add:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_D7LrbZ112iEM12wu_MdHO7v8vbCeLxvt6UDRhuYtGHkRMn3"
DATABASE_URL="your_production_database_url_here"
```

**Important:** Use your **production** database URL (the one from Vercel), not a local one. This ensures the migration updates the production database.

### Step 3: Verify

Check that both are set:

```bash
cat .env.local | grep -E "BLOB_READ_WRITE_TOKEN|DATABASE_URL"
```

You should see both variables.

### Step 4: Run Migration Again

```bash
npx tsx scripts/migrate-images-to-blob.ts
```

---

## Alternative: Use Vercel CLI

If you prefer, pull all environment variables at once:

```bash
vercel env pull .env.local
```

This will add all Vercel environment variables (including `DATABASE_URL`) to your `.env.local` file.

---

## Security Note

✅ `.env.local` is in `.gitignore`, so your database URL won't be committed to git.
