/**
 * PostHog utility functions for tracking events
 * Use these functions throughout the app to track user actions
 */

import posthog from "posthog-js"

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Only track in production
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    // Check if PostHog is loaded, if not, wait a bit and try again
    if (posthog.__loaded) {
      posthog.capture(eventName, properties)
    } else if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // PostHog might still be initializing, try to capture anyway
      try {
        posthog.capture(eventName, properties)
      } catch (error) {
        // Silently fail - PostHog will queue events if not ready
        console.debug("PostHog not ready yet:", error)
      }
    }
  }
}

/**
 * Identify a user (call after login/signup)
 * Uses user ID as distinct_id and sets person properties
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  // Only identify in production
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NODE_ENV === "production") {
    try {
      if (posthog.__loaded) {
        posthog.identify(userId, properties)
      } else {
        // PostHog might still be initializing, try anyway
        posthog.identify(userId, properties)
      }
    } catch (error) {
      console.debug("PostHog identify failed:", error)
    }
  }
}

/**
 * Reset user identification (call on logout)
 */
export function resetUser() {
  // Only reset in production
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NODE_ENV === "production") {
    try {
      if (posthog.__loaded) {
        posthog.reset()
      }
    } catch (error) {
      console.debug("PostHog reset failed:", error)
    }
  }
}

/**
 * Capture an exception for error tracking
 * NOTE: This function is a no-op. Error tracking is handled by Sentry only.
 * PostHog handles: analytics, performance, session replay.
 * Sentry handles: error tracking.
 */
export function captureException(error: Error | unknown, properties?: Record<string, any>) {
  // Errors are tracked by Sentry, not PostHog
  // This function exists for API compatibility but does nothing
  // Import Sentry.captureException directly if you need error tracking
  if (process.env.NODE_ENV === "development") {
    console.debug("captureException called - use Sentry for error tracking:", error, properties)
  }
}

/**
 * Get the current PostHog distinct ID (useful for passing to server-side)
 */
export function getDistinctId(): string | undefined {
  // Only get ID in production
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NODE_ENV === "production") {
    try {
      if (posthog.__loaded) {
        return posthog.get_distinct_id()
      }
    } catch (error) {
      console.debug("PostHog getDistinctId failed:", error)
    }
  }
  return undefined
}

/**
 * Get the current PostHog session ID (useful for passing to server-side)
 */
export function getSessionId(): string | undefined {
  // Only get session ID in production
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NODE_ENV === "production") {
    try {
      if (posthog.__loaded) {
        return posthog.get_session_id()
      }
    } catch (error) {
      console.debug("PostHog getSessionId failed:", error)
    }
  }
  return undefined
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  // Only set properties in production
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NODE_ENV === "production") {
    try {
      if (posthog.__loaded) {
        posthog.setPersonProperties(properties)
      } else {
        // Try anyway - PostHog will queue
        posthog.setPersonProperties(properties)
      }
    } catch (error) {
      console.debug("PostHog setUserProperties failed:", error)
    }
  }
}

/**
 * Track product views
 */
export function trackProductView(productId: string, productName: string) {
  trackEvent("product_viewed", {
    product_id: productId,
    product_name: productName,
  })
}

/**
 * Track product upvotes
 * Event name: upvote_product (standardized for funnels)
 */
export function trackProductUpvote(productId: string, productName: string) {
  trackEvent("upvote_product", {
    product_id: productId,
    product_name: productName,
  })
}

/**
 * Track product submissions
 * Event name: submit_product (standardized for funnels)
 */
export function trackProductSubmit(productId: string, productName: string) {
  trackEvent("submit_product", {
    product_id: productId,
    product_name: productName,
  })
}

/**
 * Track comment creation
 */
export function trackCommentCreated(productId: string, commentId: string) {
  trackEvent("comment_created", {
    product_id: productId,
    comment_id: commentId,
  })
}

/**
 * Track search queries
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent("search_performed", {
    query,
    results_count: resultsCount,
  })
}

/**
 * Track category views
 */
export function trackCategoryView(categorySlug: string, categoryName: string) {
  trackEvent("category_viewed", {
    category_slug: categorySlug,
    category_name: categoryName,
  })
}
