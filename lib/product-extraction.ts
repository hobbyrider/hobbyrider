/**
 * Product extraction utilities
 * Quality rules for extracting clean product names and taglines
 */

/**
 * Extract clean brand name from title/domain
 * Rules:
 * - Remove trailing words: "We", "The", "Home", "Official", etc.
 * - Extract brand name, not domain
 * - Remove domain extensions (.com, .io, etc.)
 * - Limit to 2 words max (enforced separately)
 * - No punctuation
 */
export function extractBrandName(rawTitle: string, url: string, maxWords: number = 2): string {
  let name = rawTitle.trim()
  
  // FIRST: Try extracting brand name from domain (most reliable)
  // This handles cases like "Free Online Form Builder" where the title doesn't contain the brand
  let domainBrand: string | null = null
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www\./, '')
    const domainParts = hostname.split('.')
    if (domainParts.length >= 2) {
      const domainName = domainParts[0]
      domainBrand = domainName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
  } catch {
    // Ignore URL parsing errors
  }
  
  // Remove common website suffixes
  name = name.replace(/\s*[-|–—]\s*(Home|Official|Welcome|Site|Website|App|Dashboard).*$/i, '')
  
  // Remove trailing generic words that often appear in titles
  const trailingWords = /\s+(We|The|Our|Your|My|Their|Its?|About|Contact|Blog|News|Support|Help|Login|Sign\s*(Up|In|Out)|Pricing|Features|FAQ|Terms|Privacy|Docs|Documentation|API|SDK|Tools|Resources|Careers|Jobs|Team|Company|Product|Solutions|Services|Platform|Software|Application|App)$/i
  name = name.replace(trailingWords, '')
  
  // Extract brand name from patterns like "Brand Name - Description" or "Brand Name | Description"
  const brandMatch = name.match(/^([^|–—\-]+?)(?:\s*[-|–—\-]\s*|$)/)
  if (brandMatch) {
    name = brandMatch[1].trim()
  }
  
  // Remove domain-like patterns (e.g., "example.com" or "forgetbill com")
  name = name.replace(/\s*\.(com|io|co|net|org|dev|app|ai|tech|xyz|me|tv|ly|sh|us|uk|ca|au|de|fr|es|it|nl|se|no|dk|fi|pl|cz|at|ch|be|ie|pt|gr|ru|jp|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|il|tr|kr|vn|th|my|sg|id|ph|nz|hk|tw|asia|online|store|shop|website|site|page|link|url)$/i, '')
  name = name.replace(/\s+(com|io|co|net|org|dev|app|ai)$/i, '')
  
  // Remove all punctuation and special characters
  name = name.replace(/[^a-zA-Z0-9\s]/g, ' ')
  
  // Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim()
  
  // Extract first N words (maxWords is enforced by caller)
  const words = name.split(/\s+/).filter(w => w.length > 0)
  
  // Remove common filler words at the start
  const fillerWords = ['the', 'a', 'an', 'our', 'your', 'my', 'their']
  while (words.length > 0 && fillerWords.includes(words[0].toLowerCase())) {
    words.shift()
  }
  
  // Check if the extracted name looks generic (like "Free Online", "The Best", etc.)
  const genericPhrases = ['free', 'online', 'best', 'top', 'new', 'simple', 'easy', 'fast', 'powerful', 'modern', 'the', 'a', 'an']
  const extractedName = words.slice(0, maxWords).join(' ')
  const isGeneric = genericPhrases.some(phrase => 
    extractedName.toLowerCase().startsWith(phrase + ' ') || 
    extractedName.toLowerCase() === phrase
  )
  
  // If extracted name is generic AND we have a domain brand, prefer domain brand
  if (isGeneric && domainBrand) {
    return domainBrand.slice(0, 40)
  }
  
  // Take first maxWords words
  const finalName = extractedName || ''
  
  // Fallback: if empty, too short, or generic, use domain brand
  if (!finalName || finalName.length < 2 || isGeneric) {
    if (domainBrand) {
      return domainBrand.slice(0, 40)
    }
    // Last resort: use first word of domain
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace(/^www\./, '')
      const domainName = hostname.split('.')[0]
      return domainName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
        .slice(0, 40)
    } catch {
      return rawTitle.slice(0, 40)
    }
  }
  
  return finalName.slice(0, 40)
}

/**
 * Extract clean tagline from description
 * Rules:
 * - Must not be a URL/domain
 * - Must not start with product name
 * - Should be a concise value proposition
 * - Max 70 characters
 * - Not too long or truncated-looking
 */
export function extractTagline(description: string | null, productName: string, url: string): string {
  if (!description) {
    // Generate a simple tagline from the product name/domain
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace(/^www\./, '')
      return `${productName || hostname} - Product`
    } catch {
      return productName || "A product"
    }
  }
  
  let tagline = description.trim()
  
  // Reject if it's a URL/domain
  if (tagline.match(/^(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i)) {
    // Try to generate from product name
    return generateDefaultTagline(productName, url)
  }
  
  // Reject if it starts with the product name (redundant)
  const nameLower = productName.toLowerCase()
  if (tagline.toLowerCase().startsWith(nameLower)) {
    // Remove product name prefix and any separator
    tagline = tagline.substring(productName.length).trim()
    // Remove leading dash, colon, or similar
    tagline = tagline.replace(/^[-:\s—–]+/, '').trim()
  }
  
  // Remove redundant "We make", "We are", "Our product", etc.
  tagline = tagline.replace(/^(We|Our|This|The|A|An)\s+(make|are|is|provides?|offers?|helps?|enables?|allows?|lets?|gives?)\s+/i, '')
  
  // Remove leading lowercase filler words that make tagline incomplete
  // Examples: "is the modern", "for the best" → "modern", "best"
  const fillerWords = ['is', 'are', 'was', 'were', 'for', 'the', 'a', 'an', 'this', 'that', 'in', 'on', 'at', 'by', 'with', 'to', 'of']
  const words = tagline.split(/\s+/)
  
  // If tagline starts with filler words, find the first meaningful word
  if (words.length > 1 && fillerWords.includes(words[0].toLowerCase())) {
    // Find first non-filler word
    let startIndex = 1
    while (startIndex < words.length && fillerWords.includes(words[startIndex].toLowerCase())) {
      startIndex++
    }
    
    if (startIndex < words.length) {
      // If we found a meaningful word, use everything from there
      tagline = words.slice(startIndex).join(' ')
    } else if (words.length > 2) {
      // If all are fillers but we have enough words, use from index 1
      tagline = words.slice(1).join(' ')
    }
  }
  
  // Capitalize first letter
  if (tagline.length > 0 && tagline[0] !== tagline[0].toUpperCase()) {
    tagline = tagline.charAt(0).toUpperCase() + tagline.slice(1)
  }
  
  // Extract first sentence or clause
  const firstSentence = tagline.split(/[.!?]\s+/)[0]?.trim()
  if (firstSentence && firstSentence.length > 0) {
    tagline = firstSentence
  }
  
  // Remove trailing commas, ellipses, and incomplete words (truncated)
  tagline = tagline.replace(/[,…]\s*$/, '') // Remove trailing comma or ellipsis
  tagline = tagline.replace(/\s+\w{1,3}$/, '') // Remove very short incomplete words
  tagline = tagline.replace(/\s*…+$/, '') // Remove trailing ellipsis
  
  // Limit length to 70 characters (but don't truncate mid-word if possible)
  if (tagline.length > 70) {
    // Try to cut at a word boundary
    const truncated = tagline.slice(0, 67)
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > 50) {
      tagline = truncated.slice(0, lastSpace)
    } else {
      tagline = truncated
    }
  }
  
  // Remove trailing comma or ellipsis after truncation
  tagline = tagline.replace(/[,…]\s*$/, '').trim()
  
  // Final validation: reject if still looks like URL or too short
  if (tagline.match(/^https?:\/\//i) || tagline.length < 10) {
    return generateDefaultTagline(productName, url)
  }
  
  // Ensure it doesn't start with incomplete phrase
  if (tagline.match(/^(is|are|was|were|for|the|a|an|this|that)\s+[a-z]/i) && tagline.split(/\s+/).length < 4) {
    // If too short and starts with filler, generate default
    return generateDefaultTagline(productName, url)
  }
  
  // Ensure tagline ends with a period (.)
  tagline = tagline.trim()
  if (tagline.length > 0 && !tagline.endsWith('.')) {
    // Check if we have space for the period (max 70 chars)
    if (tagline.length < 70) {
      tagline = tagline + '.'
    } else {
      // If at max length, replace last character with period
      tagline = tagline.slice(0, 69) + '.'
    }
  }
  
  return tagline.slice(0, 70)
}

/**
 * Generate a default tagline when extraction fails
 */
function generateDefaultTagline(productName: string, url: string): string {
  let tagline: string
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www\./, '')
    tagline = `Product by ${hostname.replace(/\..*/, '')}.`
  } catch {
    tagline = (productName || "A useful product") + "."
  }
  
  // Ensure it doesn't exceed max length and ends with period
  if (tagline.length > 70) {
    tagline = tagline.slice(0, 69) + '.'
  }
  
  return tagline
}

/**
 * Validate product name quality
 */
export function validateProductName(name: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!name || name.length < 2) {
    errors.push("Name is too short")
  }
  
  if (name.length > 40) {
    errors.push("Name is too long (max 40 characters)")
  }
  
  // Check for domain-like patterns
  if (name.match(/\.(com|io|co|net|org)$/i)) {
    errors.push("Name contains domain extension")
  }
  
  // Check for trailing generic words
  if (name.match(/\s+(We|The|Home|Official|Website)$/i)) {
    errors.push("Name ends with generic word")
  }
  
  // Check word count
  const wordCount = name.split(/\s+/).filter(w => w.length > 0).length
  if (wordCount > 3) {
    errors.push(`Name has ${wordCount} words (should be 2 max)`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate tagline quality
 */
export function validateTagline(tagline: string, productName: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!tagline || tagline.length < 10) {
    errors.push("Tagline is too short")
  }
  
  if (tagline.length > 70) {
    errors.push("Tagline is too long (max 70 characters)")
  }
  
  // Check if it's a URL
  if (tagline.match(/^(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i)) {
    errors.push("Tagline is a URL/domain")
  }
  
  // Check if it starts with product name (redundant)
  if (tagline.toLowerCase().startsWith(productName.toLowerCase())) {
    errors.push("Tagline starts with product name (redundant)")
  }
  
  // Check for truncation
  if (tagline.endsWith('...') || tagline.match(/\s+\w{1,3}$/)) {
    errors.push("Tagline appears truncated")
  }
  
  // Check if it ends with a period
  if (!tagline.endsWith('.')) {
    errors.push("Tagline must end with a period (.)")
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
