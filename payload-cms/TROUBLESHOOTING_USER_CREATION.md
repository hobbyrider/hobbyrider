# Troubleshooting: Internal Server Error on User Creation

## Quick Fix

Run this command to fix all potential schema issues:

```bash
cd payload-cms
npm run fix-users-schema
```

Then try creating the user again at http://localhost:3001/admin/create-first-user

## Common Issues

### 1. Password Column NOT NULL Constraint

**Problem:** PayloadCMS 3.0 stores passwords as `salt` and `hash`, not in a `password` column. If `password` is NOT NULL, inserts will fail.

**Fix:** Make password column nullable:
```sql
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
```

### 2. Missing Salt/Hash Columns

**Problem:** PayloadCMS 3.0 requires `salt` and `hash` columns for password storage.

**Fix:** Ensure these columns exist and are nullable:
```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "salt" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hash" TEXT;
```

### 3. Sessions Table Issues

**Problem:** If `useSessions: true` (default in PayloadCMS 3.44+), the `users_sessions` table must exist.

**Fix:** Either:
- Disable sessions in `collections/Users.ts`: `useSessions: false`
- Or ensure `users_sessions` table exists with proper foreign key

### 4. Check Server Logs

If the error persists, check the terminal where `npm run dev` is running for the exact error message.

## Debug Endpoints

- **Test user creation:** `POST http://localhost:3001/api/debug-user-create`
  ```json
  {
    "email": "test@hobbyrider.io",
    "password": "test123",
    "name": "Test User"
  }
  ```

- **Check schema:** `npm run check-users-schema`
