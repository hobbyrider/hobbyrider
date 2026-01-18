"use client"

import { useState, useEffect, cloneElement, isValidElement } from "react"
import { useSearchParams } from "next/navigation"
import { isInAppBrowser } from "@/lib/inAppBrowser"

type InAppBrowserGateProps = {
  children: React.ReactNode
  /** Optional callback when blocker is shown (for telemetry) */
  onBlocked?: () => void
}

export function InAppBrowserGate({ children, onBlocked }: InAppBrowserGateProps) {
  const [showGate, setShowGate] = useState(false)
  const searchParams = useSearchParams()

  const handleOpenInExternalBrowser = async () => {
    // Build URL with external param to prevent gate from showing again
    const url = new URL(window.location.href)
    url.searchParams.set('external', '1')
    const targetUrl = url.toString()

    // Try Web Share API first (most reliable for opening in external browser)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sign up on Hobbyrider',
          url: targetUrl,
        })
        return
      } catch (err: any) {
        // User cancelled or share failed - continue to fallback
        if (err.name !== 'AbortError') {
          console.log('Web Share API failed:', err)
        }
      }
    }

    // Fallback: try window.open
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to open in browser:', err)
    }
  }

  useEffect(() => {
    // Check if we're in an in-app browser
    const inApp = isInAppBrowser()
    
    // If we have the external param, don't show the gate (user already clicked "Open in browser")
    const externalParam = searchParams.get('external')
    const openExternalParam = searchParams.get('openExternal')
    const hasExternalParam = externalParam === '1' || openExternalParam === '1'
    
    if (inApp && !hasExternalParam) {
      setShowGate(true)
      // Log telemetry if callback provided
      if (onBlocked) {
        onBlocked()
      } else {
        // Default logging
        console.log('[InAppBrowserGate] Blocked in-app browser access')
      }
    } else {
      setShowGate(false)
    }
  }, [searchParams, onBlocked])

  if (!showGate) {
    return <>{children}</>
  }

  // When in-app browser is detected, render the button but disabled/grey with disclaimer below
  // Clone the children (button) and add disabled prop and grey styling
  const disabledChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        disabled: true,
        onClick: undefined,
        className: `${(children as React.ReactElement<any>).props?.className || ''} opacity-50 cursor-not-allowed grayscale`,
      } as any)
    : children

  return (
    <div className="w-full space-y-2">
      {/* Render button in disabled/grey state */}
      {disabledChildren}
      
      {/* Disclaimer message */}
      <p className="text-xs text-gray-600 text-center px-2">
        Google sign-in doesn't work inside in-app browsers.{" "}
        <button
          type="button"
          onClick={handleOpenInExternalBrowser}
          className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Open this page in external browser like Safari or Chrome
        </button>{" "}
        to continue.
      </p>
    </div>
  )
}
