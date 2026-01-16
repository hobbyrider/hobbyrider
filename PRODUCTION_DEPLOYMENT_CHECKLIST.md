# Production Deployment Checklist

## Pre-Deployment Steps

### 1. Commit All Changes ✅
```bash
git add .
git commit -m "Ready for production deployment - All features complete"
git push origin main
```

### 2. Environment Variables Required in Vercel

**CRITICAL (Must Have):**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- [ ] `AUTH_SECRET` - Same as NEXTAUTH_SECRET (for NextAuth v5 compatibility)

**IMPORTANT (Recommended):**
- [ ] `GOOGLE_CLIENT_ID` - For Google OAuth login
- [ ] `GOOGLE_CLIENT_SECRET` - For Google OAuth login
- [ ] `RESEND_API_KEY` - For email/magic link authentication
- [ ] `SMTP_FROM` or `EMAIL_FROM` - Email sender address

**OPTIONAL:**
- [ ] `ADMIN_PASSWORD` - For admin delete functionality
- [ ] `BLOB_READ_WRITE_TOKEN` - Usually auto-configured by Vercel

### 3. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and use it for both `NEXTAUTH_SECRET` and `AUTH_SECRET` in Vercel.

### 4. Database Setup
- [ ] Ensure production database is accessible
- [ ] Verify `DATABASE_URL` points to production database
- [ ] Prisma will auto-run migrations on deploy (via `postinstall` script)

### 5. Google OAuth Setup (if using)
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create OAuth 2.0 Client ID
- [ ] Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
- [ ] Copy Client ID and Secret to Vercel environment variables

### 6. Resend Email Setup (if using)
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your domain (or use test domain for development)
- [ ] Get API key from dashboard
- [ ] Add `RESEND_API_KEY` to Vercel
- [ ] Set `SMTP_FROM` to verified email address

---

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - If project exists: Go to project → Settings → Environment Variables
   - If new project: Click "Add New Project" → Import repository

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables (see list above)
   - Make sure to set them for **Production** environment
   - Click "Save"

4. **Deploy**
   - If new project: Click "Deploy"
   - If existing project: Push to main branch triggers auto-deploy
   - Or manually trigger: Deployments → Redeploy

5. **Wait for Build**
   - Build typically takes 2-3 minutes
   - Watch build logs for any errors
   - Fix any issues if build fails

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Note:** Environment variables set in Vercel dashboard will be used automatically.

---

## Post-Deployment Verification

### Critical Tests
- [ ] **Homepage loads** - Visit production URL
- [ ] **Authentication works** - Test sign up/login
- [ ] **Product submission** - Submit a test product
- [ ] **Image uploads** - Upload product images
- [ ] **Comments work** - Add a comment
- [ ] **Upvotes work** - Test upvote functionality
- [ ] **Search works** - Test search functionality
- [ ] **User profiles** - View/edit profile
- [ ] **Moderation dashboard** - Access `/admin/moderation` (admin only)

### Feature Verification
- [ ] **Legal pages** - `/privacy` and `/terms` load correctly
- [ ] **SEO meta tags** - Check page source for Open Graph tags
- [ ] **Analytics tracking** - View counts incrementing
- [ ] **Rate limiting** - Test rate limits work
- [ ] **Error handling** - Toast notifications appear
- [ ] **Performance** - Images load correctly
- [ ] **Sitemap** - `/sitemap.xml` accessible
- [ ] **Robots.txt** - `/robots.txt` accessible

### OAuth & Email (if configured)
- [ ] **Google OAuth** - "Sign in with Google" works
- [ ] **Magic Link** - Email authentication works
- [ ] **Email notifications** - Comment/upvote emails sent

---

## Troubleshooting

### Build Fails
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Check `DATABASE_URL` is correct
4. Ensure Prisma schema is valid: `npx prisma validate`

### Database Connection Errors
1. Verify `DATABASE_URL` is set correctly
2. Check database allows connections from Vercel IPs
3. For connection pooling, ensure pooler URL is used

### Authentication Not Working
1. Verify `NEXTAUTH_SECRET` and `AUTH_SECRET` are set
2. Check `NEXTAUTH_URL` matches production URL exactly
3. Verify OAuth redirect URIs match production URL
4. Check NextAuth debug logs in Vercel function logs

### File Uploads Not Working
1. Vercel Blob should auto-configure
2. Check `BLOB_READ_WRITE_TOKEN` is set (usually auto-set)
3. Verify upload route is accessible

### Images Not Loading
1. Check `next.config.ts` remote patterns include your image domains
2. Verify image URLs are accessible
3. Check Vercel Blob URLs are correct

---

## Post-Launch Monitoring

### Week 1
- [ ] Monitor error logs daily
- [ ] Check analytics for user behavior
- [ ] Review rate limit triggers
- [ ] Monitor database performance
- [ ] Check email delivery rates

### Ongoing
- [ ] Review analytics weekly
- [ ] Monitor error rates
- [ ] Check database size and performance
- [ ] Review user feedback
- [ ] Monitor security alerts

---

## Quick Reference

### Generate Secrets
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

### Test Database Connection
```bash
# Local test
npx prisma db push
npx prisma studio
```

### Check Build Locally
```bash
npm run build
npm run start
```

### View Logs
- Vercel Dashboard → Project → Functions → View logs
- Or use Vercel CLI: `vercel logs`

---

## Success Criteria

✅ **Deployment is successful when:**
1. Build completes without errors
2. Homepage loads correctly
3. Authentication works (signup/login)
4. Product submission works
5. Images upload and display
6. All critical features functional
7. No critical errors in logs

**You're ready to launch! 🚀**
