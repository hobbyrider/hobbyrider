/**
 * Logo extraction utilities
 * Handles detecting text-based SVGs and preferring vector graphics
 */

/**
 * Check if an SVG URL contains text-based graphics (just text) vs vector graphics
 * Returns true if SVG is text-based (should be avoided for logos)
 */
export async function isTextBasedSVG(svgUrl: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
    
    const response = await fetch(svgUrl, {
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout for SVG check
    })
    
    if (!response.ok) {
      return false // Assume not text-based if we can't fetch
    }
    
    const svgContent = await response.text()
    
    // Remove comments and normalize whitespace
    const cleanSvg = svgContent
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
    
    // Check for text elements (text-based SVG)
    const hasTextElements = /<text[^>]*>|<tspan[^>]*>/i.test(cleanSvg)
    
    // Check for vector graphics elements (actual logo graphics)
    const hasVectorGraphics = /<path[^>]*>|<circle[^>]*>|<rect[^>]*>|<ellipse[^>]*>|<polygon[^>]*>|<polyline[^>]*>|<g[^>]*>|<use[^>]*>|<image[^>]*>|<mask[^>]*>|<clipPath[^>]*>|<pattern[^>]*>/i.test(cleanSvg)
    
    // If it has text elements but no vector graphics, it's text-based
    if (hasTextElements && !hasVectorGraphics) {
      return true
    }
    
    // If it only has text and basic shapes without complex paths, might be text-based
    // Check if it's just text + simple shapes (likely text with background/border)
    const textMatch = cleanSvg.match(/<text|<tspan/gi)
    if (hasTextElements && textMatch && textMatch.length > 0) {
      // Count vector elements vs text elements
      const textMatches = textMatch.length
      const vectorMatch = cleanSvg.match(/<path|<circle|<rect|<ellipse|<polygon|<polyline|<g[^>]*>|<use[^>]*>/gi)
      const vectorMatches = vectorMatch?.length || 0
      
      // If significantly more text than vector elements, it's likely text-based
      if (textMatches > vectorMatches * 2) {
        return true
      }
    }
    
    // If it has vector graphics, it's not text-based
    if (hasVectorGraphics) {
      return false
    }
    
    // If it has neither text nor vector graphics (empty or invalid SVG), assume it's okay
    return false
  } catch (error) {
    // If we can't determine, assume it's okay (not text-based)
    return false
  }
}

/**
 * Filter logo candidates, preferring vector graphics over text-based SVGs
 * Returns candidates sorted by priority, with text-based SVGs deprioritized
 */
export async function prioritizeLogos(
  candidates: Array<{ url: string; priority: number }>
): Promise<Array<{ url: string; priority: number; isTextBased: boolean }>> {
  // Sort by priority first
  candidates.sort((a, b) => b.priority - a.priority)
  
  const checkedCandidates: Array<{ url: string; priority: number; isTextBased: boolean }> = []
  
  // Check SVG candidates for text-based content (limit to top candidates for performance)
  // Only check top 5 SVG candidates to avoid too many network requests
  const svgCandidates = candidates.filter(c => c.url.match(/\.svg$/i)).slice(0, 5)
  const checkedSvgUrls = new Map<string, boolean>()
  
  // Check SVG candidates in parallel (but limit to avoid slow performance)
  const svgChecks = await Promise.allSettled(
    svgCandidates.map(async (candidate) => {
      const isTextBased = await isTextBasedSVG(candidate.url)
      checkedSvgUrls.set(candidate.url, isTextBased)
      return { url: candidate.url, isTextBased }
    })
  )
  
  // Build checked candidates array
  for (const candidate of candidates) {
    const isSVG = candidate.url.match(/\.svg$/i)
    let isTextBased = false
    
    if (isSVG) {
      // Check if we already checked this SVG, or if it's not in top candidates, skip check
      if (checkedSvgUrls.has(candidate.url)) {
        isTextBased = checkedSvgUrls.get(candidate.url) || false
      } else if (svgCandidates.includes(candidate)) {
        // This shouldn't happen, but fallback
        isTextBased = await isTextBasedSVG(candidate.url)
      }
      // For SVGs not in top candidates, assume not text-based (don't check to save time)
    }
    
    checkedCandidates.push({
      ...candidate,
      isTextBased,
    })
  }
  
  // Re-sort: deprioritize text-based SVGs
  // Priority order: non-text SVGs > WebP > PNG > text-based SVGs
  checkedCandidates.sort((a, b) => {
    // If one is text-based SVG and the other isn't, prefer the non-text one
    if (a.isTextBased && !b.isTextBased) {
      return 1 // b comes first
    }
    if (!a.isTextBased && b.isTextBased) {
      return -1 // a comes first
    }
    
    // If both are text-based or both aren't, sort by original priority
    return b.priority - a.priority
  })
  
  return checkedCandidates
}

/**
 * Select the best logo from candidates, avoiding text-based SVGs when possible
 */
export async function selectBestLogo(
  candidates: Array<{ url: string; priority: number }>
): Promise<string | null> {
  if (candidates.length === 0) {
    return null
  }
  
  const prioritized = await prioritizeLogos(candidates)
  
  // Find first non-text-based logo
  const bestNonText = prioritized.find(c => !c.isTextBased)
  if (bestNonText) {
    return bestNonText.url
  }
  
  // If all are text-based, return the highest priority one anyway
  return prioritized[0]?.url || null
}
