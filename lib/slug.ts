/**
 * Slug generation and URL utilities for products
 * 
 * Generates URL-friendly slugs from product names and handles
 * the slug+id URL format for SEO-friendly product URLs.
 */

/**
 * Generate a URL-friendly slug from a product name
 * 
 * Rules:
 * - Lowercase everything
 * - Replace spaces and underscores with hyphens
 * - Remove special characters (keep alphanumeric and hyphens)
 * - Collapse multiple hyphens into one
 * - Trim hyphens from start/end
 * - Limit to 100 characters
 * 
 * @param name - Product name to generate slug from
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlug("Guideless AI") // "guideless-ai"
 * generateSlug("Hello  World!!") // "hello-world"
 * generateSlug("Product #1") // "product-1"
 */
export function generateSlug(name: string): string {
  if (!name || name.trim().length === 0) {
    return ""
  }

  let slug = name
    .toLowerCase()
    .trim()
    // Replace spaces, underscores, and other whitespace with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove special characters, keep only alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Collapse multiple hyphens into one
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Limit to 100 characters
    .slice(0, 100)

  // Ensure slug is not empty (fallback to generic if needed)
  if (slug.length === 0) {
    slug = "product"
  }

  return slug
}

/**
 * Extract product ID from slug+id URL format
 * 
 * Format: {slug}-{id}
 * The ID is always at the end, after the last hyphen.
 * CUID format: starts with 'c' followed by lowercase alphanumeric (typically 25 chars)
 * 
 * @param slugId - Combined slug and ID (e.g., "guideless-cmklm8srz0000awjyd5mj8l38")
 * @returns Product ID or null if invalid format
 * 
 * @example
 * extractIdFromSlugId("guideless-cmklm8srz0000awjyd5mj8l38") // "cmklm8srz0000awjyd5mj8l38"
 * extractIdFromSlugId("cmklm8srz0000awjyd5mj8l38") // "cmklm8srz0000awjyd5mj8l38" (no slug)
 */
export function extractIdFromSlugId(slugId: string): string | null {
  if (!slugId || slugId.trim().length === 0) {
    return null
  }

  // Try to find ID by matching CUID pattern (starts with 'c', followed by lowercase alphanumeric)
  // CUID format is typically 25 characters starting with 'c'
  const cuidPattern = /c[a-z0-9]{24,}$/
  const match = slugId.match(cuidPattern)
  
  if (match) {
    return match[0]
  }

  // Fallback: extract everything after the last hyphen
  // This handles cases where slug might contain the pattern
  const lastHyphenIndex = slugId.lastIndexOf("-")
  if (lastHyphenIndex >= 0 && lastHyphenIndex < slugId.length - 1) {
    const potentialId = slugId.slice(lastHyphenIndex + 1)
    // Validate it looks like a CUID (starts with 'c', reasonable length)
    if (potentialId.startsWith("c") && potentialId.length >= 20 && potentialId.length <= 30) {
      return potentialId
    }
  }

  // If no hyphen found or invalid format, assume the whole string is the ID
  // (backward compatibility with old /product/{id} format)
  if (slugId.startsWith("c") && slugId.length >= 20 && slugId.length <= 30) {
    return slugId
  }

  return null
}

/**
 * Generate canonical product URL in slug+id format
 * 
 * Format: /products/{slug}-{id}
 * 
 * @param slug - Product slug (optional, will be generated if not provided)
 * @param id - Product ID
 * @returns Canonical product URL path
 * 
 * @example
 * getProductUrl("guideless", "cmklm8srz0000awjyd5mj8l38") // "/products/guideless-cmklm8srz0000awjyd5mj8l38"
 * getProductUrl(null, "cmklm8srz0000awjyd5mj8l38") // "/products/product-cmklm8srz0000awjyd5mj8l38" (fallback)
 */
export function getProductUrl(slug: string | null | undefined, id: string): string {
  // Use slug if available, otherwise fallback to "product"
  const urlSlug = slug && slug.length > 0 ? slug : "product"
  return `/products/${urlSlug}-${id}`
}

/**
 * Build full canonical product URL with base domain
 * 
 * @param slug - Product slug (optional)
 * @param id - Product ID
 * @param baseUrl - Base URL of the site (defaults to production URL)
 * @returns Full canonical product URL
 */
export function getProductFullUrl(
  slug: string | null | undefined,
  id: string,
  baseUrl?: string
): string {
  const base = baseUrl || "https://hobbyrider.vercel.app"
  return `${base}${getProductUrl(slug, id)}`
}

/**
 * Check if a slug+id combination matches the canonical format
 * 
 * @param requestedSlugId - The slug+id from the URL
 * @param productSlug - The product's current slug
 * @param productId - The product's ID
 * @returns true if the URL matches the canonical format
 */
export function isCanonicalSlugId(
  requestedSlugId: string,
  productSlug: string | null | undefined,
  productId: string
): boolean {
  const canonicalSlugId = `${productSlug || "product"}-${productId}`
  return requestedSlugId === canonicalSlugId
}
