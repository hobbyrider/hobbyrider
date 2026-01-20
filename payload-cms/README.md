# PayloadCMS Local Setup

This is a **local-first** PayloadCMS setup. We'll test everything locally before deploying to production.

## Why Local First?

✅ **Test database connection** - Verify your existing PostgreSQL works with PayloadCMS  
✅ **Test table creation** - Use `push: true` locally (works reliably)  
✅ **Create admin user** - Set up authentication locally  
✅ **Test collections** - Verify all collections work before deploying  
✅ **Debug issues** - Much easier to debug locally than in production  

## Prerequisites

- Node.js 18+ installed
- Access to your PostgreSQL database (same one used by main app)
- Database credentials from `.env.local` or Vercel

## Quick Start

1. **Install dependencies:**
   ```bash
   cd payload-cms
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Visit http://localhost:3001/admin**
   - PayloadCMS will automatically create tables on first run
   - You'll be prompted to create the first admin user

5. **Test everything locally before deploying!**

## Environment Variables

See `.env.example` for required variables. Minimum required:
- `DATABASE_URL` - Your PostgreSQL connection string
- `PAYLOAD_SECRET` - Generate with: `openssl rand -base64 32`

## Project Structure

```
payload-cms/
├── app/
│   ├── admin/[[...segments]]/page.tsx  # Admin UI
│   └── api/payload/[...slug]/route.ts   # Payload API
├── collections/                         # Content collections
│   ├── BlogPosts.ts
│   ├── Pages.ts
│   ├── Media.ts
│   └── Users.ts
├── payload.config.ts                    # PayloadCMS config
└── package.json
```

## Collections

- **Blog Posts** - For blog content management
- **Pages** - For static pages
- **Media** - For file uploads
- **Users** - For admin users (built-in)

## Next Steps

Once everything works locally:
1. ✅ Test all collections
2. ✅ Test file uploads
3. ✅ Verify database tables are created correctly
4. ✅ Test admin interface
5. Then → Deploy to production (separate guide)

## Troubleshooting

See `TROUBLESHOOTING.md` for common issues and solutions.
