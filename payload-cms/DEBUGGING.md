# PayloadCMS Debugging Guide

## Current Error: Server-Side Exception (Error ID: 2619894518)

### Step 1: Check Vercel Function Logs (MOST IMPORTANT)

1. Go to **Vercel Dashboard** → `hobbyrider-payload` project
2. Click on **Functions** tab
3. Find the function that's erroring (likely `/admin/[[...segments]]`)
4. Click on it to view **logs**
5. Look for the actual error message (it will show the real error, not the generic one)

The logs will show something like:
- `Missing PAYLOAD_SECRET` (if that's the issue)
- Database connection errors
- Import/module errors
- Configuration errors

### Step 2: Verify Environment Variables

In Vercel Dashboard → `hobbyrider-payload` → Settings → Environment Variables:

#### Required Variables:

1. **`PAYLOAD_SECRET`** ⚠️ **MOST LIKELY ISSUE**
   - **Status**: Must be set
   - **Generate**: `openssl rand -base64 32`
   - **Value**: Should be a long random string
   - **Check**: Make sure it's not empty or missing

2. **`DATABASE_URL`**
   - **Status**: Must be set
   - **Value**: Your PostgreSQL connection string
   - **Check**: Should be the same as your main app's `DATABASE_URL`

3. **`PAYLOAD_PUBLIC_SERVER_URL`**
   - **Status**: Should be set
   - **Value**: `https://payload.hobbyrider.io`
   - **Check**: Should match your actual domain

### Step 3: Common Error Messages

#### "Missing PAYLOAD_SECRET"
- **Solution**: Add `PAYLOAD_SECRET` to Vercel environment variables
- Generate: `openssl rand -base64 32`
- Make sure it's set for **Production** environment

#### Database Connection Errors
- **Solution**: Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure connection pooling is configured if needed

#### Import/Module Errors
- **Solution**: Check build logs for TypeScript/import issues
- Verify all collection files exist

### Step 4: Quick Fix Checklist

- [ ] Checked Vercel function logs (found actual error)
- [ ] `PAYLOAD_SECRET` is set (generate if missing: `openssl rand -base64 32`)
- [ ] `DATABASE_URL` is set and correct
- [ ] `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io` is set
- [ ] All variables are set for **Production** environment
- [ ] Redeployed after adding/fixing variables

### Step 5: Generate PAYLOAD_SECRET

If you need to generate a new secret:

```bash
openssl rand -base64 32
```

Copy the output and add it to Vercel as `PAYLOAD_SECRET`.

### Step 6: After Fixing

1. **Redeploy** the project in Vercel
2. Wait for build to complete
3. Visit `https://payload.hobbyrider.io/admin`
4. Should see PayloadCMS login page (not error)

---

## Still Having Issues?

1. **Check Vercel Function Logs** - This is the most important step
2. **Verify all environment variables** are set correctly
3. **Check build logs** for any errors during build
4. **Test database connection** from your local environment

The function logs will show the exact error message that's causing the server-side exception.
