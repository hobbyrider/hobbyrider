# PayloadCMS Troubleshooting Guide

## Common Issues and Solutions

### Error: "Failed query: select from 'users' - relation does not exist"

**Problem:** PayloadCMS is trying to query tables that don't exist yet.

**Solution:** 
1. **Ensure `NODE_ENV=development` is set** in your `.env.local` file
   - `push: true` only works in development mode
   - Add: `NODE_ENV=development` to `.env.local`

2. **Restart the dev server** after adding `NODE_ENV=development`

3. **Visit http://localhost:3001/api/init** to manually trigger table creation

**Why this happens:**
- PayloadCMS `push: true` only works when `NODE_ENV=development`
- If `NODE_ENV` is not set or is `production`, PayloadCMS skips schema push
- The admin panel tries to query tables before they're created

### Import Map Generation Error

**Problem:** `npm run generate:importmap` fails with module not found errors.

**Solution:** 
- **Skip this step** - PayloadCMS will auto-generate the import map when the dev server starts
- The import map is created automatically on first run

### Database Connection Errors

**Problem:** Can't connect to database.

**Check:**
1. `DATABASE_URL` is correctly set in `.env.local`
2. Database is accessible from your network
3. Connection string format is correct: `postgres://user:password@host:port/database?sslmode=require`

### Admin User Not Created

**Problem:** `CREATE_FIRST_ADMIN=true` but admin user isn't created.

**Solutions:**
1. **Check environment variables:**
   - `CREATE_FIRST_ADMIN=true`
   - `FIRST_ADMIN_EMAIL=your-email@example.com`
   - `FIRST_ADMIN_PASSWORD=your-password`

2. **Wait for tables to be created first:**
   - The `onInit` hook runs after tables are created
   - If tables don't exist yet, user creation will fail

3. **Use the script:**
   ```bash
   ADMIN_EMAIL=admin@hobbyrider.io ADMIN_PASSWORD=your-password npm run create-admin
   ```

4. **Use the admin UI:**
   - Visit http://localhost:3001/admin
   - Fill in the "Create First User" form

### Port Already in Use

**Problem:** Port 3001 is already in use.

**Solution:** Change the port in `package.json`:
```json
"dev": "next dev -p 3002"
```

### Tables Not Created Despite push: true

**Check:**
1. ✅ `NODE_ENV=development` is set
2. ✅ `push: true` is in `payload.config.ts`
3. ✅ Database connection works
4. ✅ You have CREATE TABLE permissions on the database

**If still not working:**
- Use migrations instead (for production anyway)
- Or manually create tables via SQL
