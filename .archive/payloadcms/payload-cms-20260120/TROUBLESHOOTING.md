# PayloadCMS Troubleshooting Guide

## Server-Side Error on Admin Login

If you see "Application error: a server-side exception has occurred", check the following:

### 1. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on the function that's erroring
3. View the logs to see the actual error message

### 2. Verify Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, ensure you have:

#### Required:
- ✅ `DATABASE_URL` - Your PostgreSQL connection string
- ✅ `PAYLOAD_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` - Set to `https://payload.hobbyrider.io`

#### How to Generate PAYLOAD_SECRET:
```bash
openssl rand -base64 32
```

Copy the output and add it to Vercel as `PAYLOAD_SECRET`.

### 3. Common Error Messages

#### "Missing PAYLOAD_SECRET"
- **Solution**: Add `PAYLOAD_SECRET` to Vercel environment variables
- Generate a new secret if needed: `openssl rand -base64 32`

#### "Missing DATABASE_URL"
- **Solution**: Add `DATABASE_URL` to Vercel environment variables
- Should be the same as your main app's database

#### Database Connection Errors
- **Solution**: Verify `DATABASE_URL` is correct and database is accessible
- Check database allows connections from Vercel IPs
- Ensure connection pooling is configured if using a pooler

#### Import Map Errors
- **Solution**: Import map is now auto-generated during build
- If issues persist, check build logs for import map generation errors

### 4. Verify Domain Configuration

1. Go to Vercel Dashboard → Project Settings → **Domains**
2. Ensure `payload.hobbyrider.io` is added
3. Verify DNS is configured correctly

### 5. Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check build logs for any errors during:
   - Dependency installation
   - Import map generation
   - Build process

### 6. Test Database Connection

Verify your database is accessible:
- Check database provider status
- Verify `DATABASE_URL` format is correct
- Test connection from local environment

### 7. Redeploy After Fixing

After adding/fixing environment variables:
1. Go to Deployments
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete
4. Test again

---

## Quick Checklist

- [ ] `PAYLOAD_SECRET` is set in Vercel (generate with `openssl rand -base64 32`)
- [ ] `DATABASE_URL` is set in Vercel (same as main app)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io` is set
- [ ] Domain `payload.hobbyrider.io` is configured in Vercel
- [ ] Checked Vercel function logs for actual error
- [ ] Database is accessible and connection string is correct
- [ ] Redeployed after fixing environment variables

---

## Still Having Issues?

1. **Check Vercel Function Logs** - This shows the actual error
2. **Verify all environment variables** are set correctly
3. **Test database connection** from your local environment
4. **Check PayloadCMS documentation** for version-specific issues
