# Sentry Error Tracking Setup

Sentry has been integrated into Hobbyrider for production error tracking and monitoring.

## Overview

Sentry provides:
- **Error Tracking**: Automatic capture of errors and exceptions
- **Performance Monitoring**: Track slow queries and API calls
- **Session Replay**: Visual debugging with user session replays
- **Release Tracking**: Monitor errors by deployment version

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up (free tier available)
2. Create a new project and select "Next.js"
3. Copy your **DSN** (Data Source Name)

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` (development) and Vercel (production):

```bash
# Sentry DSN (Public for client-side, can also use same for server)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Optional: Sentry organization and project (for source maps upload)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Optional: Auth token for source maps (get from Sentry Settings > Auth Tokens)
SENTRY_AUTH_TOKEN=your-auth-token-here
```

### 3. Vercel Configuration

Add these environment variables in Vercel Dashboard:
- **Settings** → **Environment Variables**
- Add all variables from step 2

### 4. Verify Setup

1. Start the development server: `npm run dev`
2. Navigate to a page (errors are automatically captured)
3. Check your Sentry dashboard for events

## Configuration Files

In Next.js, the Sentry initialization is configured as follows:
- **`sentry.client.config.ts`**: Client-side Sentry initialization
- **`sentry.server.config.ts`**: Server-side Sentry initialization
- **`sentry.edge.config.ts`**: Edge runtime Sentry initialization (optional)
- **`instrumentation.ts`**: Next.js instrumentation entry point that registers the configs
- **`next.config.ts`**: Webpack plugin configuration for source maps

Initialization does not need to be repeated in other files. It only needs to happen in the files mentioned above.
You should use `import * as Sentry from "@sentry/nextjs"` to reference Sentry functionality.

### Configuration Example

The baseline configuration includes:

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://83f51bceb33bdb41982a70ab5191c954@o4510739808124928.ingest.de.sentry.io/4510739814023248",
  enableLogs: true,
})
```

### Logger Integration

To automatically capture console.log, console.warn, and console.error calls:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableLogs: true,
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
})
```

## Features

### Error Filtering

The configuration filters out:
- **Hydration errors in development** (expected behavior)
- **Prisma "Record not found" errors** (gracefully handled)
- **Prisma validation errors in development** (should be fixed in dev)

### Performance Monitoring

Traces are sampled at 100% (adjust in production for cost control):
- All API routes are traced
- Database queries are captured
- Slow operations are highlighted

### Session Replay

- **Error sessions**: 100% replay on errors
- **Regular sessions**: 10% sampling rate
- All text and media are masked for privacy

## Testing Error Reporting

### Test Routes (Local Development)

Two test routes are available for local testing:

1. **Client-side test**: Visit `/api/test-sentry` in your browser
   - Tests client-side error capture
   - Shows Sentry configuration status
   - Only works in development (or with `ALLOW_SENTRY_TEST` env var)

2. **Server-side test**: Visit `/api/test-sentry-server` in your browser
   - Tests server-side error capture
   - Shows server runtime information
   - Only works in development (or with `ALLOW_SENTRY_TEST` env var)

### Local Testing Steps

1. **Set up your DSN** (get from Sentry dashboard):
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Trigger test errors**:
   - Visit `http://localhost:3000/api/test-sentry`
   - Visit `http://localhost:3000/api/test-sentry-server`
   - Both should return JSON responses confirming errors were sent

4. **Check Sentry dashboard**:
   - Go to your Sentry project dashboard
   - Navigate to **Issues** → You should see the test errors
   - Click on an error to see full details, stack trace, and context

### Manual Error Capture in Code

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
Use this in try-catch blocks or areas where exceptions are expected.

```typescript
import * as Sentry from "@sentry/nextjs"

try {
  // Your code that might fail
} catch (error) {
  // Capture with context
  Sentry.captureException(error, {
    tags: {
      feature: "my-feature",
      severity: "high",
    },
    extra: {
      userId: user.id,
      action: "create-product",
    },
  })
  // Handle error
}
```

## Tracing

Spans should be created for meaningful actions within an application like button clicks, API calls, and function calls.
Use the `Sentry.startSpan` function to create a span. Child spans can exist within a parent span.

The `name` and `op` properties should be meaningful for the activities in the call.
Attach attributes based on relevant information and metrics from the request.

### Custom Span Instrumentation in Component Actions

```typescript
import * as Sentry from "@sentry/nextjs"

function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config"
        const metric = "some metric"

        // Metrics can be added to the span
        span.setAttribute("config", value)
        span.setAttribute("metric", metric)

        doSomething()
      },
    )
  }

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  )
}
```

### Custom Span Instrumentation in API Calls

```typescript
import * as Sentry from "@sentry/nextjs"

async function fetchUserData(userId: string) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      span.setAttribute("user.id", userId)
      
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      
      span.setAttribute("http.status_code", response.status)
      
      return data
    },
  )
}
```

### Nested Spans

Child spans can be created within parent spans:

```typescript
import * as Sentry from "@sentry/nextjs"

async function processOrder(orderId: string) {
  return Sentry.startSpan(
    {
      op: "function",
      name: "Process Order",
    },
    async (parentSpan) => {
      parentSpan.setAttribute("order.id", orderId)

      // Child span for database query
      const order = await Sentry.startSpan(
        {
          op: "db.query",
          name: "SELECT order FROM orders",
        },
        async (dbSpan) => {
          dbSpan.setAttribute("db.operation", "select")
          // ... database query
        }
      )

      // Child span for payment processing
      await Sentry.startSpan(
        {
          op: "http.client",
          name: "POST /api/payments",
        },
        async (paymentSpan) => {
          paymentSpan.setAttribute("payment.amount", order.amount)
          // ... payment API call
        }
      )
    }
  )
}
```

## Logging

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`.
Enable logging in Sentry using `Sentry.init({ enableLogs: true })`.
Reference the logger using `const { logger } = Sentry`.

Sentry offers a `consoleLoggingIntegration` that can be used to log specific console error types automatically without instrumenting the individual logger calls.

### Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```typescript
import * as Sentry from "@sentry/nextjs"

const { logger } = Sentry

// Trace level - detailed diagnostic information
logger.trace("Starting database connection", { database: "users" })

// Debug level - detailed information for debugging
logger.debug(logger.fmt`Cache miss for user: ${userId}`)

// Info level - general informational messages
logger.info("Updated profile", { profileId: 345 })

// Warn level - warning messages
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
})

// Error level - error events that might allow the application to continue
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
})

// Fatal level - very severe error events that might abort the application
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
})
```

### Using Logger in API Routes

```typescript
import * as Sentry from "@sentry/nextjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { logger } = Sentry

  logger.info("API route called", { route: "/api/users" })

  try {
    const data = await request.json()
    
    logger.debug(logger.fmt`Processing request for user: ${data.userId}`)

    // ... process request

    logger.info("Request processed successfully", { userId: data.userId })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Request failed", {
      error: error instanceof Error ? error.message : String(error),
      route: "/api/users",
    })

    Sentry.captureException(error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Testing Client-Side Errors

You can also test client-side errors in the browser console:

```javascript
// In browser console
throw new Error("Test client error")
```

This will be automatically captured by Sentry if configured correctly.

### What to Expect

When testing locally, you should see:

1. **In browser** (after visiting test routes):
   - JSON response with `success: true` and `message`
   - Sentry configuration status

2. **In Sentry dashboard** (within a few seconds):
   - New issues appear in the Issues tab
   - Click an issue to see:
     - Full stack trace
     - Request details (headers, query params, body)
     - Browser/environment information
     - Tags and custom context you provided

## Production Monitoring

### Alerting

Set up alerts in Sentry:
1. Go to **Alerts** in Sentry dashboard
2. Create alert rules for:
   - Error rate spikes
   - New error types
   - Slow performance issues

### Release Tracking

Sentry automatically tracks releases when you deploy. To add version info:

```typescript
// In sentry.server.config.ts and sentry.client.config.ts
Sentry.init({
  // ... other config
  release: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  environment: process.env.NODE_ENV || "development",
})
```

## Cost Considerations

### Free Tier Limits

- 5,000 errors/month
- 10,000 transactions/month
- 1,000 replay sessions/month

### Optimize Usage

1. **Reduce trace sampling** in production:
   ```typescript
   tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
   ```

2. **Adjust replay sampling**:
   ```typescript
   replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.1
   ```

3. **Use beforeSend to filter** unnecessary errors (already configured)

## Troubleshooting

### Errors Not Appearing

1. Check environment variables are set correctly
2. Verify DSN is correct
3. Check Sentry dashboard for rate limiting
4. Verify `instrumentation.ts` exists (required for Next.js App Router)

### Source Maps Not Uploading

1. Ensure `SENTRY_AUTH_TOKEN` is set
2. Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry project
3. Check build logs for Sentry upload messages

### Build Errors

If you see Sentry-related build errors:
1. Ensure `@sentry/nextjs` is installed: `npm install @sentry/nextjs`
2. Check `next.config.ts` has `withSentryConfig` wrapper
3. Verify `instrumentation.ts` exists in project root

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Sentry Pricing](https://sentry.io/pricing/)

---

**Status**: ✅ Sentry is integrated and ready for production use.

**Next Steps**:
1. Create Sentry account and get DSN
2. Add environment variables
3. Deploy and monitor errors
