# Fix: Missing BLOB_READ_WRITE_TOKEN in Production

## The Problem

You're getting this error when uploading images in production:
```
Missing BLOB_READ_WRITE_TOKEN. Configure it in production to enable uploads.
```

This means the `BLOB_READ_WRITE_TOKEN` is **not set in your Vercel production environment**.

---

## Quick Fix (2 minutes)

### Step 1: Get Your Blob Token

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com)
   - Select your project

2. **Go to Storage:**
   - Click **Storage** tab
   - Click on **"hobbyrider-blob"** (your Blob store)

3. **Get the Token:**
   - In the Blob store page, look for **"Quickstart"** section
   - Click the **`.env.local`** tab
   - Click **"Show secret"** (eye icon) to reveal the token
   - **Copy the token value**

### Step 2: Add to Vercel Environment Variables

1. **Go to Project Settings:**
   - In your Vercel project dashboard
   - Click **Settings** → **Environment Variables**

2. **Add the Token:**
   - Click **"Add Environment Variable"**
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** (paste the token you copied)
   - **Environments:** 
     - ✅ **Production**
     - ✅ **Preview** (recommended)
     - ✅ **Development** (optional, for local use)

3. **Save:**
   - Click **"Save"**

### Step 3: Redeploy (Important!)

After adding the environment variable:

**Option A: Automatic Redeploy**
- Push any commit to trigger a new deployment
- Or manually trigger a redeploy in Vercel

**Option B: Manual Redeploy**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Make sure **"Use existing Build Cache"** is **unchecked**
5. Click **"Redeploy"**

**Why redeploy?** Environment variables are only available to new deployments. Existing running instances won't have the new variable until you redeploy.

---

## Verify It's Working

After redeploying:

1. **Try uploading an image** in production
2. **It should work now!** ✅
3. **Check Vercel Blob:**
   - Storage → hobbyrider-blob → Browser
   - You should see your uploaded images

---

## Alternative: Connect Project to Blob Store

If the token still doesn't show up after adding it manually:

1. **Go to Blob Store:**
   - Storage → hobbyrider-blob

2. **Click "Connect Project"** button (top right)

3. **Select your project**

4. **This should automatically add `BLOB_READ_WRITE_TOKEN` to your project**

---

## Troubleshooting

### "Token still not working after redeploy"
- Make sure you selected **Production** environment when adding the variable
- Check that the variable name is exactly `BLOB_READ_WRITE_TOKEN` (case-sensitive)
- Verify the token value is correct (no extra spaces, quotes, etc.)
- Make sure you redeployed after adding the variable

### "Can't find Blob store"
- Make sure you're on a paid Vercel plan (Hobby or higher)
- Blob storage requires a paid plan

### "Token shows in Environment Variables but uploads still fail"
- Make sure you **redeployed** after adding the variable
- Environment variables are only available to new deployments
- Try a fresh redeploy (don't use cache)

---

## Summary

1. ✅ Get token from Blob store Quickstart
2. ✅ Add to Vercel Environment Variables (Production)
3. ✅ **Redeploy your application** (important!)
4. ✅ Test image upload in production

After redeploying, image uploads should work! 🎉
