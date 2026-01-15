# Development Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Prisma Cloud)

### Initial Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` file:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token (optional - see below)
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Sync database schema:**
   ```bash
   npx prisma db push
   ```

### Running the Development Server

**Option 1: Standard Next.js dev (requires BLOB_READ_WRITE_TOKEN)**
```bash
npm run dev
```

**Option 2: Vercel dev (automatically provides blob token)**
```bash
vercel dev
```

### File Uploads in Local Development

**Using Vercel CLI (Recommended):**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Run dev server with Vercel environment
vercel dev
```
This automatically provides `BLOB_READ_WRITE_TOKEN` for local development.

**Manual Setup:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy the `BLOB_READ_WRITE_TOKEN` value
3. Add it to your `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```
4. Run `npm run dev`

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Sync database and generate client
npm run db:sync

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ deletes all data)
npm run db:reset
```

### Project Structure

```
app/
  ├── actions/          # Server actions
  ├── api/              # API routes
  ├── components/       # React components
  ├── product/          # Product pages
  ├── user/             # User pages
  └── page.tsx          # Homepage

prisma/
  └── schema.prisma     # Database schema

lib/
  ├── auth.ts           # NextAuth configuration
  ├── prisma.ts         # Prisma client
  └── utils.ts          # Utility functions
```

### Common Tasks

**Add a new category:**
- Edit `app/actions/categories.ts` → `ensureCategoriesExist()`
- Or visit `/api/seed-categories` to trigger seeding

**Test authentication:**
- Sign up: `/signup`
- Login: `/login`
- Profile: `/user/[username]`

**Test file uploads:**
- Submit a product: `/submit`
- Upload thumbnail and gallery images
- Images are stored in Vercel Blob

### Troubleshooting

**Prisma errors:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Restart dev server
```

**File upload errors:**
- Ensure `BLOB_READ_WRITE_TOKEN` is set (or use `vercel dev`)
- Check Vercel Blob is enabled in your Vercel project

**Database connection errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check database is accessible
- For Prisma Cloud, ensure connection pooling is enabled

**NextAuth errors:**
- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your dev URL
- Check session provider is wrapped in layout

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Base URL (e.g., `http://localhost:3000`) |
| `BLOB_READ_WRITE_TOKEN` | No* | Vercel Blob token (auto-provided by `vercel dev`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth Client ID (for "Sign in with Google") |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth Client Secret |
| `RESEND_API_KEY` | No | Resend API key (for Magic Link emails) |
| `SMTP_FROM` | No | Email sender address (for Magic Link) |
| `SMTP_HOST` | No | SMTP server (alternative to Resend) |
| `SMTP_USER` | No | SMTP username (alternative to Resend) |
| `SMTP_PASSWORD` | No | SMTP password (alternative to Resend) |
| `ADMIN_PASSWORD` | No | Password for admin delete functionality |

*Required for file uploads unless using `vercel dev`

**Google OAuth Setup for Local Development:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`
