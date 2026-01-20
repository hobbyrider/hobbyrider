/**
 * Server-side PostHog client
 * Use this for tracking events in API routes and server actions
 */

import { PostHog } from "posthog-node"

let posthogClient: PostHog | null = null

/**
 * Get or create PostHog client instance (server-side)
 */
export function getPostHogClient(): PostHog | null {
  // Only initialize if API key is provided
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  // Return existing client if already initialized
  if (posthogClient) {
    return posthogClient
  }

  try {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 20, // Flush after 20 events
      flushInterval: 10000, // Or flush every 10 seconds
    })

    return posthogClient
  } catch (error) {
    console.error("Failed to initialize PostHog client:", error)
    return null
  }
}

/**
 * Shutdown PostHog client (call on app shutdown)
 */
export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown()
    posthogClient = null
  }
}
