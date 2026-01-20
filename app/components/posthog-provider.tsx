"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"

function PostHogInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize PostHog only if API key is provided
    // RESPONSIBILITY: Product analytics, pageviews, key events, and session replay.
    // Sentry handles: error tracking only.
    //
    // IMPORTANT: This provider ensures PostHog works globally for all features.
    // - Session replay is automatically enabled (unless disabled via env var)
    // - Pageviews are automatically tracked on route changes
    // - All components can import and use PostHog functions from @/lib/posthog
    // - See docs/features/POSTHOG_DEVELOPER_GUIDE.md for integration guidelines
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        // Capture pageviews automatically
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        // Privacy settings
        respect_dnt: true,
        // Session replay enabled - PostHog handles this (Sentry does not)
        // Set NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING=true to disable
        disable_session_recording: process.env.NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING === "true",
        // Load callback
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") {
            console.log("PostHog loaded with session replay enabled")
          }
        },
      })
    }
  }, [])

  // Track pageviews on route change
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      
      // Try to capture pageview - PostHog will queue if not ready yet
      try {
        if (posthog.__loaded) {
          posthog.capture("$pageview", {
            $current_url: window.location.origin + url,
          })
        } else {
          // PostHog might still be initializing, try anyway
          posthog.capture("$pageview", {
            $current_url: window.location.origin + url,
          })
        }
      } catch (error) {
        // Silently fail - PostHog will handle queuing
        console.debug("PostHog pageview capture failed:", error)
      }
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <PostHogInner>{children}</PostHogInner>
    </Suspense>
  )
}
