# Seed Table Workaround - PayloadCMS Empty Database Bug

## The Problem

PayloadCMS 3.0 has a bug where Drizzle ORM's introspection fails on completely empty databases. This prevents `push: true` from creating tables.

## The Solution

Create a simple seed table first to "warm up" the database. This allows Drizzle introspection to work properly.

## Step 1: Create Seed Table

```bash
npm run create-seed-table
```

This creates a simple `_payload_seed` table in your database.

## Step 2: Enable push: true

The `payload.config.ts` is already configured with `push: true` after the seed table is created.

## Step 3: Start PayloadCMS

```bash
npm run dev
```

Now PayloadCMS should be able to:
- ✅ Introspect the database (seed table allows this)
- ✅ Create all PayloadCMS tables automatically
- ✅ Create the admin user (if `CREATE_FIRST_ADMIN=true`)

## After Tables Are Created

Once PayloadCMS creates its tables, you can optionally remove the seed table:

```sql
DROP TABLE IF EXISTS _payload_seed;
```

However, you can also leave it - it's harmless and won't interfere with PayloadCMS.

## Why This Works

Drizzle ORM's introspection queries need at least one table to exist in the database to work properly. By creating a seed table first, we:

1. Give Drizzle something to introspect
2. Allow the introspection queries to succeed
3. Enable PayloadCMS to create its own tables via `push: true`

This is a workaround until PayloadCMS fixes the empty database bug.
