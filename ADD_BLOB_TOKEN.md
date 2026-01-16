# Adding BLOB_READ_WRITE_TOKEN to .env.local

## Steps

### 1. Copy the Token
In the Vercel Blob dashboard:
- Click **"Show secret"** (eye icon) to reveal the full token
- Click **"Copy Snippet"** to copy the entire line, or manually copy just the token value

### 2. Add to .env.local

Create or edit `.env.local` in your project root:

```bash
# Add this line (replace with your actual token)
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxx"
```

**Important:** 
- The token should be in quotes if you copy the full snippet
- Or just the token value without quotes works too

### 3. Also Add Production DATABASE_URL

For the migration scripts to work, you also need your production database URL:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxx"
DATABASE_URL="your_production_database_url"
```

### 4. Verify

Check that `.env.local` exists and has the token:

```bash
# From your project root
cat .env.local | grep BLOB_READ_WRITE_TOKEN
```

You should see the token (it will be visible in the file, but it's gitignored so it won't be committed).

---

## Next Steps

Once the token is in `.env.local`, you can:

1. **Run the migration scripts:**
   ```bash
   npx tsx scripts/migrate-images-to-blob.ts
   npx tsx scripts/migrate-thumbnails-to-blob.ts
   ```

2. **Test local image uploads** - they'll now go to Vercel Blob instead of local filesystem

---

## Security Note

✅ `.env.local` is already in `.gitignore`, so your token won't be committed to git. This is safe!
