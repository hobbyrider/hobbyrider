# Vercel Cleanup Guide for PayloadCMS

Since PayloadCMS is now archived, you should clean up the Vercel project to prevent confusion and unnecessary deployments.

## Option 1: Delete the PayloadCMS Project (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find the `hobbyrider-payload` project
3. Go to **Settings** → **General**
4. Scroll down to **Danger Zone**
5. Click **Delete Project**
6. Confirm deletion

**Benefits:**
- Clean slate - no confusion
- No unnecessary deployments
- Can recreate later if needed

## Option 2: Archive/Pause the Project (If you want to keep it)

1. Go to **Settings** → **General**
2. You can rename it to `hobbyrider-payload-archived` to mark it as inactive
3. Remove the domain `payload.hobbyrider.io` from the project:
   - Go to **Settings** → **Domains**
   - Remove `payload.hobbyrider.io`
4. Optionally disable automatic deployments in **Settings** → **Git**

**Benefits:**
- Can reactivate later
- Keeps deployment history
- Can reference old deployments

## Option 3: Keep It Running (If you plan to revisit soon)

If you plan to try PayloadCMS again soon:
1. Keep the project active
2. Keep the domain assigned
3. Document that it's currently non-functional

**Note:** This is not recommended as it may cause confusion.

## Recommended Approach

**Delete the project** (Option 1) because:
- PayloadCMS is archived with all code preserved in git
- Can recreate the project later if issues are resolved
- Cleaner Vercel dashboard
- No accidental deployments or costs

## After Cleanup

1. ✅ PayloadCMS code is archived in `.archive/payloadcms/`
2. ✅ Main hobbyrider project is unaffected
3. ✅ Domain can be reassigned later if needed
4. ✅ All documentation is preserved
