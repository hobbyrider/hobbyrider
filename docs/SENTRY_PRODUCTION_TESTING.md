# Testing Sentry in Production

This guide explains how to test Sentry error tracking, logging, and tracing in your production environment.

## Option 1: Enable Test Routes (Recommended for Initial Testing)

The easiest way to test Sentry in production is to enable the test routes:

### Step 1: Enable Test Routes in Vercel

1. Go to your **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Name:** `ALLOW_SENTRY_TEST`
   - **Value:** `true`
   - **Environment:** Select **Production** (or all environments)
3. **Save** the variable
4. **Redeploy** your application (or wait for next deployment)

### Step 2: Test the Routes

Once enabled, visit these URLs in your production site:

#### Test Client-Side & Edge Sentry Features
```
https://your-production-url.vercel.app/api/test-sentry
```

This route tests:
- ✅ Exception catching (`Sentry.captureException`)
- ✅ Tracing with spans (`Sentry.startSpan`)
- ✅ Logging with Sentry logger
- ✅ Nested spans (parent and child spans)
- ✅ Custom attributes on spans

**Expected Response:**
```json
{
  "success": true,
  "message": "Test error sent to Sentry!",
  "error": "Test Sentry error - This is intentional for testing!",
  "sentryConfigured": true,
  "note": "Check your Sentry dashboard to see this error, trace, and logs"
}
```

#### Test Server-Side Sentry Features
```
https://your-production-url.vercel.app/api/test-sentry-server
```

This route tests:
- ✅ Server-side exception catching
- ✅ Database query tracing (simulated)
- ✅ HTTP client tracing (simulated)
- ✅ Server-side logging
- ✅ Multiple log levels (info, debug, warn, error)

**Expected Response:**
```json
{
  "success": true,
  "message": "Test server error sent to Sentry!",
  "error": "Test Sentry server error - This is intentional for server-side testing!",
  "sentryConfigured": true,
  "note": "Check your Sentry dashboard to see this server error, trace, and logs"
}
```

### Step 3: Verify in Sentry Dashboard

After visiting the test routes, check your Sentry dashboard:

1. **Errors** → **Issues**
   - You should see new errors with messages like:
     - "Test Sentry error - This is intentional for testing!"
     - "Test Sentry server error - This is intentional for server-side testing!"
   
2. **Performance** → **Transactions**
   - Look for transactions named:
     - "GET /api/test-sentry"
     - "GET /api/test-sentry-server"
   - Click on them to see spans and traces

3. **Logs** → **Issues** or **Performance** tabs
   - You should see log entries with different levels:
     - `logger.info()` - informational messages
     - `logger.debug()` - debug messages
     - `logger.warn()` - warnings
     - `logger.error()` - error logs

4. **Console Logs**
   - If you have console logging integration enabled, check for:
     - `console.log()` messages
     - `console.warn()` messages
     - `console.error()` messages

### Step 4: Disable Test Routes (Optional)

After testing, you can disable the test routes:

1. Remove or set `ALLOW_SENTRY_TEST` to `false` in Vercel
2. Or delete the environment variable entirely
3. Redeploy to apply changes

---

## Option 2: Manual Testing Methods

### Test Client-Side Error Capture

Open your browser console on your production site and run:

```javascript
// Test 1: Throw an error (auto-captured by Sentry)
throw new Error("Manual test error from browser console");

// Test 2: Capture exception with context
import('@sentry/nextjs').then(Sentry => {
  Sentry.captureException(new Error("Manual test with context"), {
    tags: {
      source: "manual-test",
      environment: "production"
    },
    extra: {
      testTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  });
});
```

**Note:** The `import()` method works because Sentry is already loaded. The error will be captured automatically by Sentry's global error handler.

### Test Server-Side Error Capture

Create a temporary test action or API route:

```typescript
// app/actions/test-error.ts
'use server'

import * as Sentry from "@sentry/nextjs"

export async function testSentryError() {
  try {
    throw new Error("Manual server-side test error")
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        test: true,
        source: "manual-server-test"
      }
    })
    return { success: true, message: "Error sent to Sentry" }
  }
}
```

Then call it from a component or test page.

### Test Logging

Add temporary logging statements in your code:

```typescript
import * as Sentry from "@sentry/nextjs"

const { logger } = Sentry

// Test info log
logger.info("Production test log", { 
  feature: "testing", 
  timestamp: new Date().toISOString() 
})

// Test error log
logger.error("Production test error log", {
  severity: "high",
  user: "test-user"
})
```

### Test Tracing

Add a span to measure performance:

```typescript
import * as Sentry from "@sentry/nextjs"

await Sentry.startSpan(
  {
    op: "function",
    name: "Test Function Execution",
  },
  async (span) => {
    span.setAttribute("test", true)
    span.setAttribute("feature", "manual-testing")
    
    // Your code here
    await someOperation()
  }
)
```

---

## Option 3: Test Real-World Scenarios

### Test Error Boundaries

1. Navigate to a page that might have errors
2. Trigger error conditions (e.g., submit invalid forms)
3. Check Sentry for captured errors

### Test API Errors

1. Test API endpoints with invalid data
2. Monitor for errors in Sentry
3. Verify error context (request data, user info, etc.)

### Test Performance Issues

1. Navigate through slow pages
2. Monitor Performance tab in Sentry
3. Check for slow transactions and spans

---

## Option 4: Use Sentry's Test Event Feature

1. Go to **Sentry Dashboard** → **Settings** → **Projects** → **Your Project**
2. Click **Client Keys (DSN)**
3. Look for **Test Event** or **Send Test Event** button
4. This sends a test event directly to Sentry without affecting your app

---

## Verifying Everything Works

### ✅ Error Tracking
- [ ] Errors appear in Sentry Issues within seconds
- [ ] Error stack traces are readable (source maps uploaded)
- [ ] Error context (tags, extra data) is present
- [ ] User information is included (if `sendDefaultPii: true`)

### ✅ Logging
- [ ] Logs appear in Sentry
- [ ] Log levels are correct (info, warn, error, etc.)
- [ ] Console logs are captured (if integration enabled)
- [ ] Log context/attributes are visible

### ✅ Tracing
- [ ] Transactions appear in Performance tab
- [ ] Spans show operation timing
- [ ] Custom attributes are visible on spans
- [ ] Parent-child span relationships are clear

### ✅ Source Maps
- [ ] Error stack traces show original file names
- [ ] Line numbers match source code
- [ ] Code snippets are readable
- [ ] No minified file names in stack traces

---

## Troubleshooting

### Test Routes Return 403
- **Issue:** `ALLOW_SENTRY_TEST` not set or set incorrectly
- **Solution:** Add `ALLOW_SENTRY_TEST=true` in Vercel environment variables

### Errors Not Appearing in Sentry
- **Issue:** DSN not configured correctly
- **Solution:** Check `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
- **Check:** Sentry dashboard shows project is receiving events

### Source Maps Not Working
- **Issue:** Source maps not uploaded during build
- **Solution:** Verify `SENTRY_AUTH_TOKEN` is set in Vercel
- **Check:** Build logs show "Source Map Upload Report"

### Logs Not Appearing
- **Issue:** `enableLogs: true` not set
- **Solution:** Already configured in your setup ✅
- **Check:** Logs appear in Performance transactions, not separate Issues tab

---

## Best Practices

1. **Disable test routes after testing** - Remove `ALLOW_SENTRY_TEST` when done
2. **Monitor error rates** - Watch for spikes after deployment
3. **Set up alerts** - Configure Sentry alerts for critical errors
4. **Review regularly** - Check Sentry dashboard weekly for new issues
5. **Test before major releases** - Verify Sentry works before deploying

---

## Quick Test Checklist

After deploying to production, run through this checklist:

- [ ] Enable `ALLOW_SENTRY_TEST=true` in Vercel
- [ ] Visit `/api/test-sentry` - verify JSON response
- [ ] Visit `/api/test-sentry-server` - verify JSON response
- [ ] Check Sentry Issues - should see 2 new errors
- [ ] Check Sentry Performance - should see 2 new transactions
- [ ] Check Sentry Logs - should see log entries
- [ ] Verify source maps - stack traces show original code
- [ ] Disable `ALLOW_SENTRY_TEST` - set to `false` or remove
- [ ] Monitor for real errors - check Sentry dashboard regularly

---

**Remember:** Always disable test routes (`ALLOW_SENTRY_TEST`) after testing to prevent unnecessary test errors from cluttering your Sentry dashboard!
