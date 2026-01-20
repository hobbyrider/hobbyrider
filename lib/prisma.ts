import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    const error = new Error(
      "Missing DATABASE_URL environment variable. Please add it to:\n" +
      "- Local: .env.local file\n" +
      "- Production: Vercel Environment Variables"
    )
    console.error(error.message)
    throw error
  }
  
  // Validate URL format
  try {
    const dbUrl = new URL(url)
    if (!dbUrl.hostname) {
      throw new Error("Invalid DATABASE_URL: missing hostname")
    }
  } catch (err: any) {
    if (!err.message.includes("Invalid DATABASE_URL")) {
      // URL parsing failed - might be a postgres:// URL, that's okay
      // Just check it starts with postgres
      if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
        throw new Error(`Invalid DATABASE_URL format. Expected postgres:// or postgresql://, got: ${url.substring(0, 20)}...`)
      }
    } else {
      throw err
    }
  }
  
  return url
}

// Get database URL once
const databaseUrl = getDatabaseUrl()

// Check if using Prisma Accelerate or connection pooling service
const isPrismaService = databaseUrl.includes('db.prisma.io') || databaseUrl.includes('prisma.io')
const requiresSSL = databaseUrl.includes('sslmode=require') || 
                    databaseUrl.includes('sslmode=prefer') ||
                    isPrismaService ||
                    process.env.NODE_ENV === 'production'

const pool = new Pool({
  connectionString: databaseUrl,
  // Connection pool configuration optimized for serverless environments (Vercel)
  max: 5, // Reduced for serverless - fewer concurrent connections per function
  min: 0, // Start with 0 connections (better for serverless cold starts)
  idleTimeoutMillis: 20000, // Close idle clients after 20 seconds (faster cleanup)
  connectionTimeoutMillis: 10000, // 10 second timeout for initial connection
  statement_timeout: 30000, // 30 second timeout for queries
  query_timeout: 30000, // 30 second timeout for queries
  // Handle connection errors - allow idle connections to close in serverless
  allowExitOnIdle: true, // Better for serverless (allows connections to close when not in use)
  // SSL configuration for Prisma and production databases
  ssl: requiresSSL ? {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
    // Additional SSL options for Prisma Accelerate
    ...(isPrismaService ? {
      servername: 'db.prisma.io', // SNI (Server Name Indication) for Prisma databases
    } : {}),
  } : false,
  // Keep connections alive to prevent premature termination
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // Send keep-alive after 10 seconds
})

// Handle pool errors gracefully - log but don't crash
pool.on('error', (err: any) => {
  const errorMessage = err.message || String(err)
  const errorCode = err.code || ''
  
  console.error('❌ Database pool error:', errorMessage)
  console.error('Database host:', databaseUrl.includes('db.prisma.io') ? 'db.prisma.io (Prisma Accelerate)' : 'Custom database')
  
  // Capture connection errors in Sentry (only in production)
  if (process.env.NODE_ENV === 'production') {
    try {
      // Dynamic import to avoid issues if Sentry isn't available
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(err, {
          tags: {
            error_type: 'database_connection',
            error_code: errorCode,
            database_host: databaseUrl.includes('db.prisma.io') ? 'prisma_accelerate' : 'custom',
          },
          extra: {
            error_message: errorMessage,
            error_code: errorCode,
            stack: err.stack,
          },
          level: 'error',
        })
      }).catch(() => {
        // Sentry not available, continue without it
      })
    } catch {
      // Ignore Sentry import errors
    }
  }
  
  // Provide helpful error messages
  if (err.code === 'ECONNREFUSED') {
    console.error('⚠️  Connection refused. Check if database server is running and accessible.')
  } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || errorMessage.includes('timeout')) {
    console.error('⚠️  Connection timeout. This can happen if:')
    console.error('   1. Database server is slow to respond')
    console.error('   2. Network connectivity issues')
    console.error('   3. Firewall blocking connections')
    console.error('   4. Prisma Accelerate database is paused (check https://console.prisma.io)')
  } else if (errorMessage.includes('password authentication')) {
    console.error('⚠️  Authentication failed. Check DATABASE_URL credentials.')
  } else if (errorMessage.includes('terminated')) {
    console.error('⚠️  Connection terminated. Possible causes:')
    console.error('   1. Connection timeout (server too slow)')
    console.error('   2. Database server closed connection')
    console.error('   3. Network interruption')
    console.error('   4. Serverless function timeout')
  }
  
  // The pool will automatically create a new client if needed
})

// Handle connection lifecycle and errors
pool.on('connect', (client) => {
  // Monitor connection lifecycle
  client.on('error', (err: any) => {
    const errorMessage = err.message || String(err)
    console.error('Unexpected error on PostgreSQL client:', errorMessage)
    
    // Capture client errors in Sentry (only in production)
    if (process.env.NODE_ENV === 'production' && 
        (errorMessage.includes('terminated') || errorMessage.includes('timeout'))) {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(err, {
            tags: {
              error_type: 'database_client_error',
              error_code: err.code || 'unknown',
            },
            extra: {
              error_message: errorMessage,
            },
            level: 'warning', // Client errors are less critical than pool errors
          })
        }).catch(() => {
          // Sentry not available, continue without it
        })
      } catch {
        // Ignore Sentry import errors
      }
    }
  })
  
  client.on('end', () => {
    // Connection ended - pool will create a new one if needed
    // This is normal in serverless environments
  })
  
  // Set statement timeout on the client to prevent hanging queries
  client.query('SET statement_timeout = 30000').catch(() => {
    // Ignore if query fails - connection might be closing
  })
})

const adapter = new PrismaPg(pool)

// Create Prisma client with error handling and retry logic
let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
  
  // Test connection on initialization (only in development to catch errors early)
  // Use a timeout to prevent hanging
  if (process.env.NODE_ENV === "development") {
    // Don't await - let it fail gracefully if needed
    const connectPromise = prismaInstance.$connect()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection test timed out after 10 seconds")), 10000)
    )
    
    Promise.race([connectPromise, timeoutPromise]).catch((err: any) => {
      console.error("❌ Failed to connect to database:", err.message)
      if (err.message.includes('timeout')) {
        console.error("⚠️  Connection test timed out. This suggests:")
        console.error("   1. Database server is unreachable")
        console.error("   2. Network/firewall blocking connections")
        if (isPrismaService) {
          console.error("   3. Prisma Accelerate database may be paused")
          console.error("   → Check https://console.prisma.io to activate if needed")
        }
      } else if (isPrismaService) {
        console.error("⚠️  Using Prisma Accelerate. Check if your database is active in Prisma Dashboard.")
        console.error("⚠️  Prisma databases may be paused. Go to https://console.prisma.io to check status.")
      }
    })
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Prisma Client:", error.message)
  console.error("Database URL:", databaseUrl ? `${databaseUrl.substring(0, 30)}...` : "NOT SET")
  
  if (isPrismaService) {
    throw new Error(
      `Prisma Client initialization failed: ${error.message}\n\n` +
      `Using Prisma Accelerate (db.prisma.io). Possible issues:\n` +
      `1. Database is paused - Check https://console.prisma.io and activate if needed\n` +
      `2. Invalid credentials - Verify DATABASE_URL in .env.local\n` +
      `3. Network connectivity - Check firewall/VPN settings\n` +
      `4. Connection timeout - Server may be slow or unreachable`
    )
  } else {
    throw new Error(
      `Prisma Client initialization failed: ${error.message}\n\n` +
      `Troubleshooting steps:\n` +
      `1. Verify DATABASE_URL is correct in .env.local\n` +
      `2. Check if database server is accessible (network/firewall)\n` +
      `3. Verify database credentials are valid\n` +
      `4. Connection timeout - Increase timeout or check network\n` +
      `5. Try running: npx prisma db execute --stdin <<< "SELECT 1"`
    )
  }
}

export const prisma = prismaInstance

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/**
 * Retry wrapper for database queries to handle connection timeouts in serverless environments
 * Automatically retries queries that fail due to connection issues
 */
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    retryableErrors?: string[]
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000, // Start with 1 second delay
    retryableErrors = [
      'Connection terminated',
      'Connection terminated unexpectedly',
      'Connection timeout',
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
    ],
  } = options

  let lastError: Error | unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error: any) {
      lastError = error

      // Check if error is retryable
      const errorMessage = error?.message || String(error)
      const errorCode = error?.code || ''
      const isRetryable = retryableErrors.some(
        (retryableError) =>
          errorMessage.includes(retryableError) ||
          errorCode.includes(retryableError)
      )

      // Don't retry if it's not a connection error or we've exhausted retries
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = retryDelay * Math.pow(2, attempt)
      
      console.warn(
        `⚠️  Database query failed (attempt ${attempt + 1}/${maxRetries + 1}): ${errorMessage}. Retrying in ${delay}ms...`
      )

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Try to reconnect if connection was lost
      try {
        await prisma.$connect()
      } catch (connectError) {
        // Ignore connection errors during retry - will be caught in next attempt
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}