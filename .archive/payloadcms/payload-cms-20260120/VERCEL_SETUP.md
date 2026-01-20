# Vercel Setup for PayloadCMS Subdomain

## Critical: Separate Vercel Project Required

PayloadCMS must be deployed as a **separate Vercel project** from the main app. The main app and PayloadCMS cannot share the same deployment.

## Setup Steps

### 1. Create Separate Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import the **same GitHub repository** (`hobbyrider/hobbyrider`)
4. **Important Settings:**
   - **Root Directory**: Set to `payload-cms`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 2. Configure Domain

1. In the Vercel project settings, go to **Domains**
2. Add custom domain: `payload.hobbyrider.io`
3. Configure DNS if needed (A/CNAME records)

### 3. Environment Variables

Set these in Vercel → Settings → Environment Variables for the **payload project**:

**Required:**
```
PAYLOAD_PUBLIC_SERVER_URL=https://payload.hobbyrider.io
PAYLOAD_SECRET=your_payload_secret_here
DATABASE_URL=your_database_url
```

**For automatic first admin user creation (Optional):**
```
CREATE_FIRST_ADMIN=true
FIRST_ADMIN_EMAIL=your-email@example.com
FIRST_ADMIN_PASSWORD=your-secure-password
```

**Important:** Do NOT set these in the payload project:
- ❌ `NEXTAUTH_URL`
- ❌ `NEXTAUTH_SECRET`
- ❌ `GOOGLE_CLIENT_ID` (unless you configure PayloadCMS OAuth separately)

These are for the main app only.

### 4. Verify Deployment

After deployment:
1. Visit `https://payload.hobbyrider.io/admin`
2. You should see **PayloadCMS's own login page** (not the main app's login)
3. If you see the main app's login, the project isn't properly isolated

## Troubleshooting

### Still seeing main app's login page?

1. **Check Root Directory**: Ensure it's set to `payload-cms` in Vercel project settings
2. **Check Domain**: Verify `payload.hobbyrider.io` is assigned to the correct project
3. **Check Build Logs**: Look for errors in Vercel build logs
4. **Check Environment Variables**: Ensure `PAYLOAD_PUBLIC_SERVER_URL` is set correctly

### 404 on routes?

- Ensure the `payload-cms` directory structure is correct
- Check that `app/admin/[[...segments]]/page.tsx` exists
- Verify `payload.config.ts` is in the root of `payload-cms/`

### Database errors?

- Ensure `DATABASE_URL` is set correctly
- Check that PayloadCMS tables are created (call `/api/init-db` once)
- Verify `PAYLOAD_SECRET` is set

## Quick Checklist

- [ ] Separate Vercel project created
- [ ] Root Directory set to `payload-cms`
- [ ] Domain `payload.hobbyrider.io` added
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` set
- [ ] `PAYLOAD_SECRET` set
- [ ] `DATABASE_URL` set
- [ ] First admin user created (via env vars or script)
- [ ] Can access `https://payload.hobbyrider.io/admin` and see PayloadCMS login
