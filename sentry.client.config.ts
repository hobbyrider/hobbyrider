// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// RESPONSIBILITY: Error tracking and basic breadcrumbs only.
// PostHog handles: analytics, performance, session replay.

import * as Sentry from "@sentry/nextjs"

// Only initialize Sentry in browser context, not in edge runtime
// Skip initialization in development/localhost
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://83f51bceb33bdb41982a70ab5191c954@o4510739808124928.ingest.de.sentry.io/4510739814023248",

    // Enable logging in Sentry for breadcrumbs
    enableLogs: true,

    // Disable performance tracing - PostHog handles this
    tracesSampleRate: 0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Disable session replay - PostHog handles this
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,

    // Integrations - only error tracking and breadcrumbs
    integrations: [
      // Send console.log, console.warn, and console.error calls as breadcrumbs (not events)
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      // Note: browserTracingIntegration is NOT included - PostHog handles performance tracking
    ],

    // Filter out known non-critical errors
    beforeSend(event, hint) {
      // Ignore hydration errors in development (they're expected)
      if (
        process.env.NODE_ENV === "development" &&
        event.exception?.values?.[0]?.value?.includes("Hydration")
      ) {
        return null
      }
      return event
    },
  })
}
