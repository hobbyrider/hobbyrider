/**
 * Shared metadata utilities for Hobbyrider
 * 
 * Provides consistent Open Graph, Twitter, and SEO metadata across all pages
 */

import type { Metadata } from "next"

/**
 * Get the base URL for the application
 * Prioritizes NEXTAUTH_URL, then VERCEL_URL, with fallback to production URL
 */
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.io"
}

/**
 * Truncate text to optimal length for social cards
 * OG title: 55-65 chars recommended
 * OG description: 155-160 chars recommended
 * Twitter: 200 chars max for description
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || ""
  return text.slice(0, maxLength - 3).trim() + "..."
}

/**
 * Get default OG image path by type
 * 
 * @param type - Type of default image: "default", "product", "category", or "user"
 * @returns Full URL to default OG image
 */
export function getDefaultOGImage(
  type: "default" | "product" | "category" | "user" = "default"
): string {
  const baseUrl = getBaseUrl()
  // Use generic default if specific type doesn't exist
  return `${baseUrl}/og-${type}-default.png`
}

/**
 * Build Open Graph image metadata array
 * 
 * @param url - Image URL (absolute or relative)
 * @param width - Image width in pixels (default: 1200)
 * @param height - Image height in pixels (default: 630)
 * @param alt - Alt text for image
 * @returns Metadata images array
 */
export function buildOGImage(
  url: string,
  width: number = 1200,
  height: number = 630,
  alt: string = ""
): NonNullable<NonNullable<Metadata["openGraph"]>["images"]> {
  // Ensure absolute URL
  const imageUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`

  return [
    {
      url: imageUrl,
      width,
      height,
      alt,
    },
  ]
}

/**
 * Get base metadata configuration shared across all pages
 * 
 * @returns Base metadata configuration
 */
export function getBaseMetadata(): Partial<Metadata> {
  const baseUrl = getBaseUrl()
  return {
    metadataBase: new URL(baseUrl),
    openGraph: {
      siteName: "hobbyrider",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      // TODO: Add Twitter handle if available
      // creator: "@hobbyrider",
    },
  }
}

/**
 * Build complete Open Graph metadata object
 * 
 * @param title - Page title
 * @param description - Page description (will be truncated to 160 chars)
 * @param url - Canonical URL (relative or absolute)
 * @param image - Image URL (relative or absolute)
 * @param type - Open Graph type (default: "website")
 * @param imageWidth - Image width (default: 1200)
 * @param imageHeight - Image height (default: 630)
 * @returns Complete Open Graph metadata
 */
export function buildOpenGraphMetadata({
  title,
  description,
  url,
  image,
  type = "website",
  imageWidth = 1200,
  imageHeight = 630,
}: {
  title: string
  description: string
  url: string
  image?: string
  type?: "website" | "article" | "profile"
  imageWidth?: number
  imageHeight?: number
}): NonNullable<Metadata["openGraph"]> {
  const baseUrl = getBaseUrl()
  const canonicalUrl = url.startsWith("http") ? url : `${baseUrl}${url}`
  const truncatedDesc = truncateText(description, 160)

  const ogMetadata: NonNullable<Metadata["openGraph"]> = {
    title,
    description: truncatedDesc,
    url: canonicalUrl,
    siteName: "hobbyrider",
    locale: "en_US",
    type,
  }

  if (image) {
    ogMetadata.images = buildOGImage(image, imageWidth, imageHeight, title)
  }

  return ogMetadata
}

/**
 * Build complete Twitter card metadata
 * 
 * @param title - Card title
 * @param description - Card description (will be truncated to 200 chars)
 * @param image - Image URL (optional)
 * @param cardType - Card type (default: "summary_large_image" if image, else "summary")
 * @returns Complete Twitter metadata
 */
export function buildTwitterMetadata({
  title,
  description,
  image,
  cardType,
}: {
  title: string
  description: string
  image?: string
  cardType?: "summary" | "summary_large_image"
}): NonNullable<Metadata["twitter"]> {
  const truncatedDesc = truncateText(description, 200)
  const baseUrl = getBaseUrl()

  const twitterMetadata: NonNullable<Metadata["twitter"]> = {
    card: cardType || (image ? "summary_large_image" : "summary"),
    title,
    description: truncatedDesc,
  }

  if (image) {
    const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`
    twitterMetadata.images = [imageUrl]
  }

  return twitterMetadata
}

/**
 * Get product OG image with multi-tier fallback
 * 
 * 1. Product thumbnail (if available)
 * 2. First product image (if available)
 * 3. Default product OG image (fallback)
 * 
 * @param thumbnail - Product thumbnail URL (optional)
 * @param images - Array of product image URLs (optional)
 * @returns Best available image URL
 */
export function getProductOGImage(
  thumbnail?: string | null,
  images?: Array<{ url: string }> | null
): string {
  // 1. Use thumbnail if available
  if (thumbnail) {
    return thumbnail
  }

  // 2. Use first product image if available
  if (images && images.length > 0 && images[0]?.url) {
    return images[0].url
  }

  // 3. Fallback to default product OG image
  return getDefaultOGImage("product")
}

/**
 * Get user profile OG image with fallback
 * 
 * @param userImage - User avatar/image URL (optional)
 * @returns User image or default user OG image
 */
export function getUserOGImage(userImage?: string | null): string {
  return userImage || getDefaultOGImage("user")
}
