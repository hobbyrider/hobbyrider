/**
 * Helper functions for making browser-like fetch requests
 * to avoid 403 Forbidden errors from bot protection
 */

/**
 * Get realistic browser headers to avoid bot detection
 */
export function getBrowserHeaders(): HeadersInit {
  return {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  }
}

/**
 * Get simplified headers for image/logo requests
 */
export function getImageHeaders(): HeadersInit {
  return {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }
}

/**
 * Fetch with browser-like headers and better error handling
 */
export async function fetchWithBrowserHeaders(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = options.headers 
    ? { ...getBrowserHeaders(), ...options.headers }
    : getBrowserHeaders()

  const response = await fetch(url, {
    ...options,
    headers,
    redirect: 'follow',
    signal: options.signal || AbortSignal.timeout(30000), // 30 second timeout
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        `HTTP ${response.status}: Forbidden - Website blocked the request.\n` +
        `This site may have bot protection (e.g., Cloudflare).\n` +
        `Try adding the product manually or wait a few minutes and try again.`
      )
    }
    if (response.status === 429) {
      throw new Error(
        `HTTP ${response.status}: Too Many Requests - Rate limited.\n` +
        `Wait a moment and try again.`
      )
    }
    if (response.status === 401 || response.status === 404) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  return response
}
