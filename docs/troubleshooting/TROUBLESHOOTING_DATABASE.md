# Database Connection Troubleshooting

## Error: "Failed to connect to upstream database" or "Connection terminated due to connection timeout"

These errors indicate that your application cannot reach the PostgreSQL database server, or the connection is timing out.

### Most Common Causes

1. **Prisma Accelerate Database is Paused** (Most likely for `db.prisma.io`)
2. **Connection timeout** - Database server is slow or unreachable
3. **Network/firewall blocking** - Connection is blocked
4. **Invalid credentials** - DATABASE_URL is incorrect

### Quick Checks

1. **Verify DATABASE_URL is set**
   ```bash
   # Check if DATABASE_URL exists in .env.local
   cat .env.local | grep DATABASE_URL
   ```

2. **Test database connection**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1"
   ```

3. **Check Prisma database status** (if using Prisma Accelerate)
   - Go to https://console.prisma.io
   - Check if your database is active (not paused)
   - Verify credentials are correct

### Common Issues

#### Issue 1: Prisma Accelerate Database is Paused (MOST COMMON)
**Symptoms:** 
- Connection refused to `db.prisma.io`
- Connection terminated due to connection timeout
- "Can't reach database server at `db.prisma.io:5432`"

**Solution:**
1. Go to https://console.prisma.io
2. Find your database project
3. Check if the database shows as "Paused" or "Inactive"
4. Click "Activate" or "Resume" if paused
5. Wait 2-5 minutes for the database to fully start
6. Try your application again

**Note:** Prisma Accelerate databases automatically pause after inactivity to save costs. You need to manually activate them when starting development.

#### Issue 2: Network/Firewall Blocking Connection
**Symptoms:** Connection timeout or connection refused

**Solution:**
- Check if firewall is blocking port 5432
- Verify VPN settings (some VPNs block database connections)
- Try connecting from a different network
- Check if database allows connections from your IP

#### Issue 3: Invalid Credentials
**Symptoms:** Authentication failed errors

**Solution:**
1. Get a fresh DATABASE_URL from Prisma Dashboard
2. Update `.env.local` with the new connection string
3. Restart the development server

#### Issue 4: SSL Connection Issues
**Symptoms:** SSL-related errors

**Solution:**
- Prisma Accelerate requires SSL (automatically configured)
- For custom databases, ensure `?sslmode=require` in DATABASE_URL

### Environment Variables

Make sure `.env.local` contains:
```bash
DATABASE_URL="postgres://user:password@host:5432/database?sslmode=require"
```

### Still Having Issues?

1. **Check Prisma logs:**
   ```bash
   # Enable query logging in development
   # Already enabled in lib/prisma.ts when NODE_ENV=development
   ```

2. **Verify database is accessible:**
   ```bash
   # Try connecting with psql (if installed)
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check network connectivity:**
   - Try accessing database from a different network
   - Verify database server is not down (check provider status page)

4. **For Prisma Accelerate specifically:**
   - Check Prisma status page: https://status.prisma.io
   - Verify database is active in console
   - Generate a new connection string if needed

### Connection Pool Configuration

The app uses optimized connection pooling for serverless:
- `min: 0` - No connections maintained (better for serverless cold starts)
- `max: 10` - Maximum 10 connections
- `allowExitOnIdle: true` - Allows connections to close when idle
- SSL enabled automatically for Prisma databases

These settings are configured in `lib/prisma.ts`.
