# Database Connection Timeout Fix

## Problem

In production (Vercel serverless), database connections were timing out with errors:
- `Error: Connection terminated unexpectedly`
- `Error: Connection terminated due to connection timeout`

These errors occur because:
1. Serverless functions have short-lived connections
2. Database servers close idle connections
3. Network timeouts in serverless environments
4. Connection pool doesn't handle reconnection properly

## Solution

### 1. Improved Connection Pool Configuration

Updated `lib/prisma.ts` with serverless-optimized settings:

```typescript
const pool = new Pool({
  max: 5,                    // Reduced from 10 (fewer connections per function)
  min: 0,                    // Start with 0 (better for cold starts)
  idleTimeoutMillis: 20000,  // Faster cleanup (20s instead of 30s)
  connectionTimeoutMillis: 10000, // 10s initial connection timeout
  statement_timeout: 30000,  // 30s query timeout
  query_timeout: 30000,      // 30s query timeout
  keepAlive: true,           // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Send keep-alive after 10s
})
```

### 2. Retry Logic Wrapper

Added `withRetry()` function to automatically retry failed queries:

```typescript
import { prisma, withRetry } from '@/lib/prisma'

// Wrap critical queries with retry logic
const result = await withRetry(async () => {
  return await prisma.software.findMany({
    where: { isHidden: false },
    take: 10,
  })
})
```

**Features:**
- Automatically retries up to 3 times
- Exponential backoff (1s, 2s, 4s delays)
- Only retries connection-related errors
- Reconnects before retrying

### 3. Enhanced Error Handling

- Connection errors are now captured in Sentry
- Better error messages with troubleshooting steps
- Graceful handling of connection termination

### 4. Connection Lifecycle Monitoring

- Monitors connection errors and termination
- Automatically sets statement timeouts
- Logs connection issues for debugging

## Usage

### For Critical Queries

Wrap important database queries with retry logic:

```typescript
import { prisma, withRetry } from '@/lib/prisma'

// Example: Fetching products
export async function getProducts() {
  return await withRetry(async () => {
    return await prisma.software.findMany({
      where: { isHidden: false },
      orderBy: { upvotes: 'desc' },
      take: 20,
    })
  })
}

// Example: Creating a comment
export async function createComment(productId: string, content: string) {
  return await withRetry(async () => {
    return await prisma.comment.create({
      data: {
        productId,
        content,
        authorId: userId,
      },
    })
  })
}
```

### For Non-Critical Queries

Regular queries can still use `prisma` directly - they'll benefit from the improved pool configuration:

```typescript
import { prisma } from '@/lib/prisma'

// Simple queries don't need retry wrapper
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
})
```

## When to Use Retry Logic

**Use `withRetry()` for:**
- ✅ Critical user-facing operations (product creation, comments, upvotes)
- ✅ Operations that must succeed (authentication, payments)
- ✅ Queries that are frequently called
- ✅ Operations that users wait for

**Don't use `withRetry()` for:**
- ❌ Background jobs (can fail and retry later)
- ❌ Non-critical queries (analytics, logging)
- ❌ Queries that are already wrapped in try-catch with custom retry logic

## Monitoring

Connection errors are automatically captured in Sentry with:
- Error type: `database_connection` or `database_client_error`
- Error code and message
- Database host information
- Stack traces

Check Sentry dashboard for:
- Frequency of connection errors
- Patterns (time of day, specific endpoints)
- Error codes (ECONNRESET, ETIMEDOUT, etc.)

## Additional Recommendations

### 1. Use Connection Pooler (Recommended)

If using a database provider that supports connection pooling (like Neon, Supabase, or Railway), use the pooler URL:

```bash
# Instead of direct connection:
DATABASE_URL=postgres://user:pass@host:5432/db

# Use pooler URL:
DATABASE_URL=postgres://user:pass@host:5432/db?pgbouncer=true
```

### 2. Monitor Connection Pool

Watch for these metrics:
- Connection pool size
- Idle connection count
- Connection errors per minute
- Query timeout frequency

### 3. Database Provider Settings

Check your database provider settings:
- **Connection timeout**: Should be ≥ 30 seconds
- **Idle timeout**: Should be ≥ 20 seconds
- **Max connections**: Should accommodate your pool size (5 per function × number of concurrent functions)

## Testing

To test the retry logic locally:

```typescript
// Simulate connection error
import { withRetry } from '@/lib/prisma'

const result = await withRetry(async () => {
  // This will fail and retry
  throw new Error('Connection terminated unexpectedly')
}, {
  maxRetries: 3,
  retryDelay: 500, // Faster for testing
})
```

## Troubleshooting

### Still seeing connection errors?

1. **Check database provider status**
   - Verify database is running
   - Check for maintenance windows
   - Review provider status page

2. **Review connection pool settings**
   - Reduce `max` connections if hitting limits
   - Increase `connectionTimeoutMillis` if connections are slow
   - Adjust `idleTimeoutMillis` based on usage patterns

3. **Use connection pooler**
   - Most providers offer connection poolers (PgBouncer, etc.)
   - Reduces connection overhead
   - Better for serverless environments

4. **Monitor Sentry**
   - Check error frequency
   - Look for patterns
   - Review error codes

## Status

✅ **Fixed**: Connection pool configuration optimized for serverless  
✅ **Fixed**: Retry logic added for automatic recovery  
✅ **Fixed**: Error handling improved with Sentry integration  
✅ **Fixed**: Connection lifecycle monitoring added  

---

**Date**: 2025-01-XX  
**Impact**: Reduces connection timeout errors in production  
**Breaking Changes**: None - backward compatible
