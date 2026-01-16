# Fix: BLOB_READ_WRITE_TOKEN Not Showing

## Quick Fix Steps

Since you've created the Blob store but don't see the token, try these in order:

### Option 1: Connect Project to Blob Store (Most Common Fix)

1. **Go to your Blob store:**
   - Vercel Dashboard → Storage → Click on "hobbyrider-blob"

2. **Click "Connect Project" button** (top right of the Blob store page)

3. **Select your project** from the list

4. **This should automatically:**
   - Add `BLOB_READ_WRITE_TOKEN` to your project's environment variables
   - Make it available in the selected environments

5. **Refresh Environment Variables page** and check again

---

### Option 2: Get Token from Blob Store Settings

1. **Go to Blob store:**
   - Storage → hobbyrider-blob → **Settings** tab

2. **Look for "Read-Write Token" or "Tokens" section**

3. **Copy the token value**

4. **Manually add to Environment Variables:**
   - Go to Project → Settings → Environment Variables
   - Click **"Add Environment Variable"**
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: (paste the token you copied)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

---

### Option 3: Use Vercel CLI

Even if the token doesn't show in the dashboard, try pulling it via CLI:

```bash
# Make sure you're in your project directory
cd /Users/evaldasbieliunas/ph-clone

# Pull environment variables (this might include the token)
vercel env pull .env.local
```

Then check if `BLOB_READ_WRITE_TOKEN` is in your `.env.local` file.

---

### Option 4: Check Environment Selection

1. **Go to Blob store → Settings**

2. **Check which environments are enabled:**
   - Make sure **Production** is selected
   - Make sure **Preview** is selected (optional)
   - Make sure **Development** is selected (for local use)

3. **If Production wasn't selected:**
   - Edit the store settings
   - Enable Production environment
   - Save changes
   - The token should now appear in Environment Variables

---

## Verify It's Working

After trying the above:

1. **Check Environment Variables:**
   - Settings → Environment Variables
   - Look for `BLOB_READ_WRITE_TOKEN`

2. **Or check via CLI:**
   ```bash
   vercel env ls
   ```

3. **Test in production:**
   - Try uploading an image
   - It should now work!

---

## Most Likely Solution

**Try Option 1 first** - clicking "Connect Project" in the Blob store dashboard. This is usually what's missing and will automatically set everything up correctly.
