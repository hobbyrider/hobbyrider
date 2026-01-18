/**
 * Detects if the current user agent is an in-app browser (webview)
 * that may not support Google OAuth properly.
 * 
 * Common in-app browsers:
 * - Facebook/Messenger (FBAN, FBAV)
 * - Instagram
 * - LinkedIn
 * - Line
 * - TikTok
 * - Snapchat
 * - Twitter/X in-app browser
 * - Generic WebView (but avoid false positives for Safari/Chrome)
 */

export function isInAppBrowser(userAgent?: string): boolean {
  const ua = userAgent || (typeof window !== 'undefined' ? window.navigator.userAgent : '')

  if (!ua) {
    return false
  }

  const uaLower = ua.toLowerCase()

  // Facebook/Messenger in-app browser
  if (uaLower.includes('fban') || uaLower.includes('fbav')) {
    return true
  }

  // Instagram in-app browser
  if (uaLower.includes('instagram')) {
    return true
  }

  // LinkedIn in-app browser
  if (uaLower.includes('linkedinapp') || uaLower.includes('linkedin')) {
    // LinkedIn mobile app uses webview
    if (uaLower.includes('mobile') && uaLower.includes('linkedin')) {
      return true
    }
  }

  // Line app
  if (uaLower.includes('line/')) {
    return true
  }

  // TikTok in-app browser
  if (uaLower.includes('musical_ly') || uaLower.includes('tiktok')) {
    return true
  }

  // Snapchat
  if (uaLower.includes('snapchat')) {
    return true
  }

  // Twitter/X in-app browser
  // Twitter often uses webview but we need to be careful not to block all Twitter traffic
  if (uaLower.includes('twitterandroid') || uaLower.includes('twitterios')) {
    return true
  }

  // Generic WebView detection (be careful to avoid false positives)
  // Check for WebView in mobile contexts, but exclude Chrome and Safari which have their own WebView
  const isMobile = /android|iphone|ipad|ipod/i.test(ua)
  const isWebView = uaLower.includes('wv') || uaLower.includes('webview')
  
  if (isMobile && isWebView) {
    // Exclude Chrome and Safari - they have proper browser contexts
    if (!uaLower.includes('chrome') && !uaLower.includes('safari')) {
      return true
    }
  }

  // Android WebView (but not Chrome)
  if (uaLower.includes('android') && uaLower.includes('wv') && !uaLower.includes('chrome')) {
    return true
  }

  return false
}
