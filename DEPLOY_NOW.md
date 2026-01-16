# 🚀 Deploy to Production - Quick Guide

## Step 1: Push to GitHub

Your code is committed and ready. Push to GitHub:

```bash
git push origin main
```

## Step 2: Deploy on Vercel

### If you already have a Vercel project:

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Select your project** (or create new if needed)
3. **Go to Settings → Environment Variables**
4. **Add/Verify these variables:**

#### Required Variables:
```
DATABASE_URL=your_production_postgresql_url
NEXTAUTH_SECRET=your_generated_secret_here
AUTH_SECRET=your_generated_secret_here (same as NEXTAUTH_SECRET)
NEXTAUTH_URL=https://your-app.vercel.app
```

#### Generate Secret:
```bash
openssl rand -base64 32
```
Use the output for both `NEXTAUTH_SECRET` and `AUTH_SECRET`.

#### Optional but Recommended:
```
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
RESEND_API_KEY=re_your_resend_api_key
SMTP_FROM=noreply@yourdomain.com
```

5. **Deploy:**
   - If auto-deploy is enabled: Push to `main` triggers deployment
   - Or manually: Go to Deployments → Redeploy

### If this is a new project:

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Add Environment Variables** (see list above)
6. **Click "Deploy"**

## Step 3: Wait for Build

- Build typically takes 2-3 minutes
- Watch the build logs for any errors
- If build fails, check the logs and fix issues

## Step 4: Verify Deployment

Once deployed, test these critical features:

1. ✅ **Homepage** - `https://your-app.vercel.app`
2. ✅ **Sign Up/Login** - Test authentication
3. ✅ **Product Submission** - Submit a test product
4. ✅ **Image Upload** - Upload product images
5. ✅ **Comments** - Add a comment
6. ✅ **Upvotes** - Test upvote functionality
7. ✅ **Search** - Test search
8. ✅ **Admin Moderation** - `/admin/moderation` (admin only)

## Quick Troubleshooting

### Build Fails?
- Check environment variables are set
- Verify `DATABASE_URL` is correct
- Check build logs in Vercel dashboard

### Auth Not Working?
- Verify `NEXTAUTH_SECRET` and `AUTH_SECRET` are set
- Check `NEXTAUTH_URL` matches your production URL exactly
- Verify OAuth redirect URIs in Google Console

### Database Errors?
- Verify `DATABASE_URL` points to production database
- Check database allows connections from Vercel
- Prisma migrations run automatically on deploy

## Need Help?

See `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for detailed instructions.

---

**You're ready to launch! 🎉**
