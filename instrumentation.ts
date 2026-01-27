// This file configures the initialization of Sentry for edge features
// (https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

export async function register() {
  // Only load Sentry in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config")
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config")
    }
  }
}

export const onRequestError = Sentry.captureRequestError
