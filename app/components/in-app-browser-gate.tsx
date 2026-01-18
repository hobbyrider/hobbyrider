"use client"

import { useState, useEffect } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { isInAppBrowser } from "@/lib/inAppBrowser"

type InAppBrowserGateProps = {
  children: React.ReactNode
  /** Optional callback when blocker is shown (for telemetry) */
  onBlocked?: () => void
}

export function InAppBrowserGate({ children, onBlocked }: InAppBrowserGateProps) {
  const [showGate, setShowGate] = useState(false)
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

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

  const handleOpenInBrowser = async () => {
    // Build URL with external param to prevent gate from showing again
    const url = new URL(window.location.href)
    url.searchParams.set('external', '1')
    const targetUrl = url.toString()

    // Unfortunately, JavaScript cannot reliably force an in-app browser to open the system browser
    // We need to guide users to use the native share button or try Web Share API
    
    // Method 1: Try Web Share API (most reliable if supported)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sign up on Hobbyrider',
          url: targetUrl,
        })
        // If share succeeded, the user will open it in their browser
        return
      } catch (err: any) {
        // User cancelled or share failed - continue to fallback methods
        if (err.name !== 'AbortError') {
          console.log('Web Share API failed:', err)
        }
      }
    }

    // Method 2: Try window.open with _blank
    try {
      const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer')
      
      // Check if window.open was successful
      if (newWindow) {
        // Give it a moment, then check if it's still focused on this window
        setTimeout(() => {
          if (document.hasFocus() && newWindow) {
            // Still in webview, show instructions
            showBrowserInstructions()
          }
        }, 500)
      } else {
        // window.open was blocked, show instructions immediately
        showBrowserInstructions()
      }
    } catch (err) {
      console.error('window.open failed:', err)
      showBrowserInstructions()
    }
  }

  const showBrowserInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const message = isIOS
      ? 'To continue, tap the share button at the bottom of the screen and select "Open in Safari".'
      : 'To continue, tap the share button at the bottom of the screen and select "Open in Chrome" or your default browser.'
    
    alert(message)
  }

  const handleCopyLink = async () => {
    // Get clean URL without temporary params for copying
    const url = new URL(window.location.href)
    url.searchParams.delete('external')
    url.searchParams.delete('openExternal')
    const cleanUrl = url.toString()

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = cleanUrl
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('Failed to copy link:', err)
        }
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  if (!showGate) {
    return <>{children}</>
  }

  return (
    <div className="w-full rounded-lg border-2 border-amber-200 bg-amber-50 p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-amber-900">
          Open in Safari or Chrome
        </h3>
        <p className="text-sm text-amber-800">
          Google sign-in doesn't work inside in-app browsers. Open this page in Safari or Chrome to continue.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleOpenInBrowser}
          className="flex-1 rounded-lg bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          Open in browser
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 rounded-lg border-2 border-amber-300 bg-white text-amber-900 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
