# Setting Up Vercel Blob Storage

## Quick Setup (2 minutes)

### Step 1: Create Blob Store in Vercel

1. **Go to your Vercel project dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Select your project

2. **Navigate to Storage**
   - Click on the **Storage** tab in your project
   - Or go to: Project → Storage

3. **Create a Blob Store**
   - Click **"Create Database"** or **"Connect Database"**
   - Select **"Blob"** from the options
   - Choose a name (e.g., "hobbyrider-blob" or just "blob")
   - Select environments:
     - ✅ **Production**
     - ✅ **Preview** (optional but recommended)
     - ✅ **Development** (optional, for local dev)

4. **Create the store**
   - Click **"Create"** or **"Continue"**

### Step 2: Token is Auto-Created! ✅

Once the Blob store is created, Vercel **automatically**:
- Creates the `BLOB_READ_WRITE_TOKEN` environment variable
- Adds it to your selected environments
- Makes it available to your application

### Step 3: Verify Token Exists

1. Go to **Settings → Environment Variables**
2. You should now see `BLOB_READ_WRITE_TOKEN` in the list
3. The value will be masked (showing `••••••••••••`)

### Step 4: Use Locally (Optional)

If you want to use it locally for the migration scripts:

**Option A: Use Vercel CLI (Recommended)**
```bash
# Pull all environment variables including BLOB_READ_WRITE_TOKEN
vercel env pull .env.local
```

**Option B: Copy Manually**
1. In Vercel dashboard → Environment Variables
2. Click on `BLOB_READ_WRITE_TOKEN`
3. Click the eye icon to reveal the value
4. Copy it
5. Add to your `.env.local`:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```

---

## That's It! 🎉

Once the Blob store is created:
- ✅ `BLOB_READ_WRITE_TOKEN` is automatically available in production
- ✅ New image uploads will go to Vercel Blob
- ✅ You can run the migration scripts to move existing images

---

## Troubleshooting

### "Storage tab not visible"
- Make sure you're on a paid Vercel plan (Hobby plan or higher)
- Blob storage requires a paid plan

### "Can't find Blob option"
- Look for "Create Database" → "Blob" option
- Or check Vercel's Storage documentation

### "Token still not showing"

**If the token doesn't appear in Environment Variables, try these steps:**

1. **Check Blob Store Settings:**
   - Go to your Blob store (Storage → hobbyrider-blob)
   - Click on **"Settings"** tab
   - Look for **"Read-Write Token"** or **"Tokens"** section
   - The token might be displayed there

2. **Connect Project to Blob Store:**
   - In your Blob store dashboard, click **"Connect Project"** button (top right)
   - Select your project
   - This should automatically add the token to your project's environment variables

3. **Check Environment Selection:**
   - Go to Blob store → Settings
   - Verify which environments are selected (Production, Preview, Development)
   - If Production wasn't selected, the token won't be available in production
   - You may need to edit the store settings to add missing environments

4. **Use Vercel CLI to Pull Token:**
   ```bash
   # This will pull all environment variables including BLOB_READ_WRITE_TOKEN
   vercel env pull .env.local
   ```
   Even if it doesn't show in the dashboard, the CLI might be able to pull it

5. **Manual Token Retrieval:**
   - Go to Blob store → Settings
   - Look for "Read-Write Token" or "API Tokens" section
   - Copy the token value
   - Manually add it to Environment Variables:
     - Click "Add Environment Variable"
     - Name: `BLOB_READ_WRITE_TOKEN`
     - Value: (paste the token)
     - Select environments: Production, Preview, Development
     - Click "Save"

---

## Next Steps

After setting up Blob storage:

1. **Run migration scripts** to move existing local images:
   ```bash
   npx tsx scripts/migrate-images-to-blob.ts
   npx tsx scripts/migrate-thumbnails-to-blob.ts
   ```

2. **Test image uploads** in production - they should now work!
