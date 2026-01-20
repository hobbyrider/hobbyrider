# Fix: DrizzleQueryError on Empty Database

## The Problem

PayloadCMS 3.0 has a bug where Drizzle ORM's schema introspection fails on completely empty databases. The error:

```
Failed query: SELECT conname AS primary_key
```

This prevents `push: true` from working on empty databases.

## The Solution: Use Migrations Instead

Since `push: true` doesn't work with empty databases, we need to use migrations instead.

### Step 1: Generate Initial Migration

```bash
cd payload-cms
npm run migrate:create init
```

This will:
- Generate migration files in the `migrations/` directory
- Analyze your collections and create SQL to build all tables

### Step 2: Apply Migration to Create Tables

```bash
npm run migrate
```

This will:
- Connect to your database
- Create all PayloadCMS tables (users, blog-posts, pages, media, etc.)

### Step 3: Restart Dev Server

After tables are created, restart the dev server:

```bash
npm run dev
```

Now you should be able to:
- Visit http://localhost:3001/admin
- Log in or create your first admin user

## Why This Happens

PayloadCMS 3.0's `push: true` mode relies on Drizzle ORM's introspection to:
1. Check what tables exist
2. Compare with your schema
3. Create missing tables/columns

But on an **empty database**, the introspection query itself fails because:
- Drizzle tries to query primary key constraints
- The query has a bug with parameter binding on empty databases
- PayloadCMS can't proceed without successful introspection

**This is a known bug in PayloadCMS 3.0** - the workaround is to use migrations.

## Alternative: Create One Table Manually

If migrations don't work, you could manually create a simple table first to "warm up" the database, then `push: true` might work. But migrations are cleaner.

## After Tables Are Created

Once tables exist:
- `push: false` is fine (we'll use migrations for schema changes)
- Or switch back to `push: true` if you prefer (for development only)
- Admin user creation should work via `CREATE_FIRST_ADMIN=true`
