# PayloadCMS Troubleshooting Guide

## Common Issues and Solutions

### Error: "Failed query: SELECT conname AS primary_key"

**Problem:** PayloadCMS 3.0 has a bug where Drizzle ORM's introspection fails on completely empty databases.

**Solution:** 
1. Create a seed table first:
   ```bash
   npm run create-seed-table
   ```
2. This allows Drizzle introspection to work properly
3. Restart the dev server

### Error: "Internal Server Error" when creating first user

**Problem:** Manually created tables might not match PayloadCMS's expected schema exactly.

**Solution:**
1. Drop manually created tables:
   ```bash
   npm run drop-manual-tables
   ```
2. Ensure `push: true` is set in `payload.config.ts`
3. Ensure `NODE_ENV=development` is set in `.env.local`
4. Restart the dev server - PayloadCMS will create tables with the correct schema

### Error: "Failed query: select from 'users' - relation does not exist"

**Problem:** PayloadCMS is trying to query tables that don't exist yet.

**Check:**
1. Is `push: true` set in `payload.config.ts`?
2. Is `NODE_ENV=development` set in `.env.local`?
3. Does a seed table exist? Run `npm run create-seed-table`
4. Did you restart the server after changes?

### Import Map Generation Error

**Solution:** 
- **Skip this step** - PayloadCMS will auto-generate the import map when you start the dev server
- The import map is created automatically on first run

### Database Connection Errors

**Check:**
1. `DATABASE_URL` is correctly set in `.env.local`
2. Database is accessible from your network
3. Connection string format is correct: `postgres://user:password@host:port/database?sslmode=verify-full`
4. Database user has permissions to create tables

### Admin User Not Created Automatically

**If `CREATE_FIRST_ADMIN=true` doesn't work:**

**Option 1: Use Admin UI**
- Visit http://localhost:3001/admin
- Fill out the "Create First User" form

**Option 2: Use Script**
```bash
ADMIN_EMAIL=admin@hobbyrider.io ADMIN_PASSWORD=your-password npm run create-admin
```

### Port Already in Use

**Solution:** Change the port in `package.json`:
```json
"dev": "next dev -p 3002"
```

## Quick Fix Checklist

If PayloadCMS isn't working:

1. ✅ **Seed table exists?** Run `npm run create-seed-table`
2. ✅ **`push: true` enabled?** Check `payload.config.ts`
3. ✅ **`NODE_ENV=development` set?** Check `.env.local`
4. ✅ **Tables match schema?** If you created tables manually, drop them and let PayloadCMS create them
5. ✅ **Restart server?** Full restart after any config changes

## Workflow

**Best practice for local development:**
1. Create seed table: `npm run create-seed-table`
2. Ensure `push: true` in config
3. Ensure `NODE_ENV=development` in `.env.local`
4. Start server: `npm run dev`
5. Visit `/admin` - PayloadCMS should create tables automatically
6. Create first user via UI

**If manual tables were created:**
1. Drop manual tables: `npm run drop-manual-tables`
2. Keep seed table (don't drop it)
3. Restart server
4. Let PayloadCMS create tables with correct schema
