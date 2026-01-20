// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// RESPONSIBILITY: Error tracking and basic breadcrumbs only.
// PostHog handles: analytics, performance, session replay.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "https://83f51bceb33bdb41982a70ab5191c954@o4510739808124928.ingest.de.sentry.io/4510739814023248",

  // Disable performance tracing - PostHog handles this
  tracesSampleRate: 0,

  // Enable logs to be sent to Sentry for breadcrumbs
  enableLogs: true,

  // Integrations - only error tracking and breadcrumbs
  integrations: [
    // Send console.log, console.warn, and console.error calls as breadcrumbs (not events)
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
