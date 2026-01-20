// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

// Only initialize Sentry in browser context, not in edge runtime
if (typeof window !== "undefined") {
  const integrations: any[] = []

  // Add replay integration if available (not available in edge runtime)
  try {
    // Check if replay integration is available
    if ("replayIntegration" in Sentry && typeof Sentry.replayIntegration === "function") {
      integrations.push(
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        })
      )
    }
  } catch (error) {
    // Replay integration not available, continue without it
    console.warn("Sentry replay integration not available:", error)
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://83f51bceb33bdb41982a70ab5191c954@o4510739808124928.ingest.de.sentry.io/4510739814023248",

    // Enable logging in Sentry
    enableLogs: true,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Replay may only be enabled for the client-side
    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Integrations
    integrations: [
      ...integrations,
      // Send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
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
