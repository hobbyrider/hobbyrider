# PayloadCMS 3.0 Known Issue: Empty Database

## The Problem

PayloadCMS 3.0 has a **critical bug** that prevents it from working with completely empty databases:

**Error:**
```
Failed query: SELECT conname AS primary_key
            FROM   pg_constraint join pg_class on (pg_class.oid = conrelid)
            WHERE  contype = 'p' 
            AND    connamespace = $1::regnamespace  
            AND    pg_class.relname = $2;
params: 
```

**What's happening:**
- Drizzle ORM (used by PayloadCMS) tries to introspect the database
- It queries for primary key constraints
- The query parameters are empty/buggy on empty databases
- PayloadCMS can't proceed without successful introspection

**Why this blocks everything:**
- `push: true` mode requires introspection to work
- Migration generation also requires introspection
- The error happens before any tables can be created

## Current Status

This is a **known bug in PayloadCMS 3.0**. The PayloadCMS team is aware of it.

## Workarounds

### Option 1: Wait for PayloadCMS Fix (Recommended)
Wait for PayloadCMS to release a fix for this bug. Check:
- PayloadCMS GitHub Issues
- PayloadCMS Discord
- Release notes for version 3.0.1+

### Option 2: Manually Create a Seed Table
Create one simple table in your database first to "warm up" the database:

```sql
CREATE TABLE IF NOT EXISTS _payload_migration_lock (
  id SERIAL PRIMARY KEY,
  is_locked BOOLEAN DEFAULT false
);
```

This might allow Drizzle introspection to work, but it's not guaranteed.

### Option 3: Use a Different Database
If possible, try a different PostgreSQL setup or version to see if it works around the issue.

### Option 4: Wait for Stable Release
Consider waiting for PayloadCMS 3.0 to become more stable before using it in production.

## Temporary Solution

For now, we're blocked on PayloadCMS fixing this bug. The local setup is correct, but we can't proceed until this introspection issue is resolved.

## Alternative: Use PayloadCMS 2.x

If you need PayloadCMS immediately, consider using version 2.x instead, which doesn't have this issue. However, v2 has different APIs and might require code changes.

## Next Steps

1. ✅ **Local setup is complete** - all code is ready
2. ⏳ **Waiting for PayloadCMS fix** - for the empty database issue
3. 📝 **Monitor PayloadCMS releases** - check for fixes
4. 🔄 **Once fixed** - restart dev server and tables will create
