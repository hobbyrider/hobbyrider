# PayloadCMS Local Setup Guide

This guide will help you set up PayloadCMS locally first, so you can test everything before deploying to production.

## Prerequisites

- Node.js 18+ installed
- Access to your PostgreSQL database (same one used by main app)
- Database credentials from `.env.local` or Vercel

## Step 1: Install Dependencies

```bash
cd payload-cms
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the `payload-cms/` directory:

```bash
# Copy from main app's .env.local or get from Vercel
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require

# Generate with: openssl rand -base64 32
PAYLOAD_SECRET=your-generated-secret-here

# Local development URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001

# Optional: Create first admin user automatically
CREATE_FIRST_ADMIN=true
FIRST_ADMIN_EMAIL=admin@hobbyrider.io
FIRST_ADMIN_PASSWORD=your-secure-password-here
```

**To get your DATABASE_URL:**
- Check your main app's `.env.local` file
- Or get it from Vercel → Project Settings → Environment Variables

**To generate PAYLOAD_SECRET:**
```bash
openssl rand -base64 32
```

## Step 3: Generate Import Map

PayloadCMS needs an import map for the admin UI:

```bash
npm run generate:importmap
```

This creates `app/admin/importMap.js` automatically.

## Step 4: Start Development Server

```bash
npm run dev
```

This starts PayloadCMS on **http://localhost:3001** (different port from main app).

## Step 5: Access Admin Panel

1. Open http://localhost:3001/admin in your browser
2. On first visit, PayloadCMS will:
   - Automatically create database tables (using `push: true`)
   - If `CREATE_FIRST_ADMIN=true` is set, create the admin user
   - Show the login page

3. If admin user was created automatically:
   - Log in with `FIRST_ADMIN_EMAIL` and `FIRST_ADMIN_PASSWORD`
   - You should see the admin dashboard

4. If admin user wasn't created:
   - You'll see a form to create the first admin user
   - Fill in email and password
   - Click "Create First User"

## Step 6: Test Everything

Once logged in, test:

1. ✅ **Collections**
   - Create a blog post
   - Create a page
   - Upload media

2. ✅ **Database Tables**
   - Check your database to see PayloadCMS tables were created
   - Tables should include: `users`, `blog_posts`, `pages`, `media`, etc.

3. ✅ **File Uploads**
   - Upload an image in the Media collection
   - Should be saved to `payload-cms/media/` directory locally

4. ✅ **API Endpoints**
   - Visit http://localhost:3001/api/payload/blog-posts
   - Should return your blog posts as JSON

## Troubleshooting

### "Missing DATABASE_URL" Error

Make sure `.env.local` exists in the `payload-cms/` directory and contains `DATABASE_URL`.

### "Missing PAYLOAD_SECRET" Error

Generate a secret and add it to `.env.local`:
```bash
openssl rand -base64 32
```

### Tables Not Created

If tables aren't created automatically:
1. Check that `push: true` is set in `payload.config.ts`
2. Check database connection string is correct
3. Make sure you have permissions to create tables
4. Restart the dev server

### Can't Create Admin User

**Option 1: Use Environment Variables**
```bash
CREATE_FIRST_ADMIN=true
FIRST_ADMIN_EMAIL=admin@hobbyrider.io
FIRST_ADMIN_PASSWORD=your-password
```

**Option 2: Use Script**
```bash
ADMIN_EMAIL=admin@hobbyrider.io ADMIN_PASSWORD=your-password npm run create-admin
```

**Option 3: Use Admin UI**
- Visit http://localhost:3001/admin
- Use the "Create First User" form

### Port Already in Use

If port 3001 is in use, change it in `package.json`:
```json
"dev": "next dev -p 3002"
```

## Next Steps

Once everything works locally:

1. ✅ **Verify all collections work**
2. ✅ **Test file uploads**
3. ✅ **Test API endpoints**
4. ✅ **Create some test content**

**Then → Deploy to Production**

See `PRODUCTION_SETUP.md` for deployment instructions (to be created after local setup is confirmed working).

## What's Working Locally

✅ Database connection  
✅ Table creation (via `push: true`)  
✅ Admin UI  
✅ Collections (BlogPosts, Pages, Media, Users)  
✅ File uploads (local storage)  
✅ API endpoints  

## What Needs Production Configuration

- File uploads (need Vercel Blob or S3 adapter)
- Environment variables in Vercel
- Separate Vercel project or subdomain
- Migrations (instead of `push: true`)
