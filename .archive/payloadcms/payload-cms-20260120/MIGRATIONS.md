# PayloadCMS Database Migrations

## Issue: Tables Not Created Automatically

`push: true` only works in **development mode**. In production (Vercel), tables are not created automatically.

## Solution: Use Migrations

### Step 1: Generate Initial Migration (Local)

Run this locally (with DATABASE_URL pointing to your production database):

```bash
cd payload-cms
DATABASE_URL=your_production_database_url npm run migrate:create init
```

This creates migration files in `migrations/` directory.

### Step 2: Apply Migrations

Apply the migrations to create all tables:

```bash
DATABASE_URL=your_production_database_url npm run migrate
```

### Step 3: Create First Admin User

After tables are created, either:

**Option A: Via environment variables (on next deployment)**
Set in Vercel:
```
CREATE_FIRST_ADMIN=true
FIRST_ADMIN_EMAIL=your-email@example.com
FIRST_ADMIN_PASSWORD=your-password
```

**Option B: Via API route**
Visit `/api/init-db` after tables are created - it will create the first admin user.

**Option C: Via script**
```bash
DATABASE_URL=your_production_database_url npm run create-admin your-email@example.com your-password
```

## Alternative: Manual Table Creation

If migrations don't work, you can manually access `/admin` - PayloadCMS might create tables on first access even in production (if `push: true` is set).

## Quick Fix for Now

1. **Temporarily enable development mode** in Vercel:
   - Set `NODE_ENV=development` in environment variables
   - Redeploy
   - Tables should be created automatically
   - Then remove `NODE_ENV=development` and redeploy

2. **Or use migrations** (recommended for production)
