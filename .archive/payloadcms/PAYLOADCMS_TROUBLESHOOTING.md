# PayloadCMS Troubleshooting Guide

## Error: "Failed query: SELECT conname AS primary_key"

### Problem
This error occurs when PayloadCMS tries to introspect the PostgreSQL database schema but the query parameters are missing or incorrect.

### Solutions

#### 1. Ensure DATABASE_URL is Set
Make sure `DATABASE_URL` is properly set in your `.env.local` file:
```bash
DATABASE_URL=postgres://user:password@host:port/database
```

#### 2. Check Database Connection
Verify your database connection string is correct and the database is accessible:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### 3. Disable Schema Pushing
If you're using Prisma for migrations, disable PayloadCMS automatic schema pushing:

In `payload.config.ts`:
```typescript
db: postgresAdapter({
  pool: {
    connectionString: getDatabaseUrl(),
  },
  push: false, // Disable automatic schema pushing
}),
```

#### 4. Initialize PayloadCMS Tables Manually
If PayloadCMS tables don't exist yet, you may need to initialize them:

1. **Option A: Use Payload CLI** (if available)
   ```bash
   npx payload migrate
   ```

2. **Option B: Let PayloadCMS create tables on first run**
   - Make sure `push: false` is set
   - Visit `/admin` - PayloadCMS will create tables automatically

#### 5. Check for Table Name Conflicts
The `Users` collection uses the slug `'users'` which might conflict with your existing Prisma `User` model. PayloadCMS will create its own `payload_users` table, so this should be fine, but ensure:

- PayloadCMS tables are prefixed with `payload_`
- Your Prisma tables don't have the same names

#### 6. Verify PostgresAdapter Configuration
Ensure your adapter configuration matches your database setup:

```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL || '',
    // Optional pool settings
    max: 10,
    idleTimeoutMillis: 30000,
  },
  push: false, // Recommended if using Prisma for migrations
}),
```

#### 7. Check PayloadCMS and Database Versions
Ensure you're using compatible versions:
- PayloadCMS 3.71.1
- @payloadcms/db-postgres 3.71.1
- PostgreSQL 12+ (recommended)

#### 8. Clear Next.js Cache
Sometimes cached builds can cause issues:
```bash
rm -rf .next
npm run dev
```

### Common Causes

1. **Missing DATABASE_URL** - Most common cause
2. **Database not accessible** - Network/firewall issues
3. **Schema conflicts** - Tables already exist with different structure
4. **Connection pool exhaustion** - Too many connections
5. **SSL/TLS issues** - Managed databases require SSL

### Next Steps

1. ✅ Check `.env.local` has `DATABASE_URL`
2. ✅ Verify database is accessible
3. ✅ Set `push: false` in adapter config
4. ✅ Clear `.next` cache
5. ✅ Restart dev server

If the error persists, check:
- Database logs for connection errors
- PayloadCMS logs for more detailed error messages
- Network connectivity to your database
