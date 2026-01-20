# Directus CMS Setup

Directus is a modern, open-source headless CMS that works seamlessly with your existing PostgreSQL database.

## Why Directus?

✅ **Uses Your Existing Database** - Connects to your PostgreSQL database (same one as Prisma)
✅ **Beautiful Admin UI** - Professional content management interface
✅ **No Migration Issues** - Works with existing schema or creates its own tables
✅ **Next.js Integration** - Excellent SDK and React components
✅ **Self-Hosted or Cloud** - Your choice
✅ **Stable & Mature** - Production-ready, active community

## Quick Setup Options

### Option 1: Directus Cloud (Easiest - Recommended)

1. Sign up at [directus.cloud](https://directus.cloud)
2. Create a new project
3. Configure database connection to your PostgreSQL
4. Get your API credentials
5. Set environment variables in Vercel

**Pros:** No infrastructure to manage, fast setup
**Cons:** Monthly cost (generous free tier available)

### Option 2: Self-Hosted Directus (Full Control)

Deploy Directus as a separate service using:
- Docker Compose (easiest for self-hosting)
- Railway, Render, or Fly.io (serverless-friendly)
- Your own server

**Pros:** Full control, can use existing database
**Cons:** Need to manage hosting/infrastructure

### Option 3: Directus in Vercel (Advanced)

Directus can run in serverless functions, but this is more complex.

## What We're Setting Up

- Directus SDK integration in Next.js app
- API routes to fetch content from Directus
- Blog posts and pages collections
- Media library for images
- Type-safe content fetching
