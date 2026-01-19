"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { extractBrandName, extractTagline } from "@/lib/product-extraction"
import { selectBestLogo } from "@/lib/logo-extraction"
import { fetchWithBrowserHeaders, getBrowserHeaders } from "@/lib/fetch-helpers"

const prismaAny = prisma as any

/**
 * Extract product metadata from a website URL
 */
async function extractProductMetadata(url: string, maxWords: number = 2) {
  try {
    // Use browser-like headers to avoid 403 Forbidden errors
    const response = await fetchWithBrowserHeaders(url)
    
    const html = await response.text()
    const baseUrl = new URL(url)
    
    // Parse HTML - Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    let rawTitle = titleMatch?.[1]?.trim() || baseUrl.hostname.replace(/^www\./, '')
    
    // Extract meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const metaDescription = descMatch?.[1]?.trim() || null
    
    // Extract OG title (often better than <title>)
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    if (ogTitleMatch?.[1]) {
      rawTitle = ogTitleMatch[1].trim()
    }
    
    // Extract clean brand name using quality rules
    const name = extractBrandName(rawTitle, url, maxWords)
    
    // Extract OG description for tagline
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const taglineText = ogDescMatch?.[1] || metaDescription || ""
    
    // Extract clean tagline using quality rules
    const tagline = extractTagline(taglineText, name, url)
    
    let description = metaDescription || ogDescMatch?.[1] || null
    if (description && description.length > 800) {
      description = description.slice(0, 797) + "..."
    }
    if (!description && taglineText) {
      description = taglineText.split(/[.!?]/).slice(0, 2).join(". ").trim()
      if (description.length > 800) {
        description = description.slice(0, 797) + "..."
      }
    }
    
    // Extract logo - prioritize high-quality formats (SVG, WebP)
    let logoUrl: string | null = null
    const logoCandidates: Array<{ url: string; priority: number }> = []
    
    // 1. Look for SVG logos (highest priority)
    const svgLogos = [
      ...html.matchAll(/<link[^>]*rel=["'][^"']*logo["'][^>]*href=["']([^"']+\.svg[^"']*)["']/gi),
      ...html.matchAll(/<link[^>]*rel=["'][^"']*icon["'][^>]*href=["']([^"']+\.svg[^"']*)["']/gi),
    ]
    for (const match of svgLogos) {
      logoCandidates.push({ url: new URL(match[1], url).href, priority: 10 })
    }
    
    // 2. Look for WebP logos (high priority)
    const webpLogos = [
      ...html.matchAll(/<link[^>]*rel=["'][^"']*logo["'][^>]*href=["']([^"']+\.webp[^"']*)["']/gi),
      ...html.matchAll(/<link[^>]*rel=["'][^"']*icon["'][^>]*href=["']([^"']+\.webp[^"']*)["']/gi),
    ]
    for (const match of webpLogos) {
      logoCandidates.push({ url: new URL(match[1], url).href, priority: 9 })
    }
    
    // 3. Check for apple-touch-icon (usually high quality PNG with padding - PREFERRED for logos)
    const appleTouchIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    if (appleTouchIcon?.[1]) {
      const iconUrl = new URL(appleTouchIcon[1], url).href
      // Apple touch icons typically have ~10% padding, great for logo display
      // Give higher priority than regular SVGs (unless SVG is vector graphics)
      const priority = iconUrl.match(/\.(svg|webp)$/i) ? 11 : 10 // Higher than regular SVGs
      logoCandidates.push({ url: iconUrl, priority })
    }
    
    // 4. Check for icon with sizes (prefer larger sizes - often have better padding)
    const sizedIcons = html.matchAll(/<link[^>]*rel=["'][^"']*icon["'][^>]*sizes=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)
    for (const match of sizedIcons) {
      const sizes = match[1]
      const iconUrl = new URL(match[2], url).href
      // Higher priority for larger sizes (192x192, 512x512) - they often have padding
      let priority = 5
      if (sizes.includes('512') || sizes.includes('256')) priority = 8 // Larger icons often have padding
      else if (sizes.includes('192') || sizes.includes('180')) priority = 7
      // Prefer SVG/WebP but still prioritize larger sizes for padding
      if (iconUrl.match(/\.(svg|webp)$/i)) priority += 1
      logoCandidates.push({ url: iconUrl, priority })
    }
    
    // 5. OG image (if it looks like a logo, not a screenshot)
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch?.[1]) {
      const ogImageUrl = new URL(ogImageMatch[1], url).href
      const lowerUrl = ogImageUrl.toLowerCase()
      // Skip if URL contains screenshot-related keywords (likely not a logo)
      if (!lowerUrl.match(/(screenshot|preview|image|photo|capture|thumbnail|banner|hero|header)/)) {
        // OG images are often screenshots, so lower priority unless they're SVG/WebP
        const priority = ogImageUrl.match(/\.(svg|webp)$/i) ? 8 : 4
        logoCandidates.push({ url: ogImageUrl, priority })
      }
    }
    
    // 6. Standard favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["']/i)
    if (faviconMatch?.[1]) {
      const faviconUrl = new URL(faviconMatch[1], url).href
      const priority = faviconUrl.match(/\.(svg|webp)$/i) ? 7 : 3
      logoCandidates.push({ url: faviconUrl, priority })
    }
    
    // 7. Try common logo paths (prioritize apple-touch-icon for padding, then SVG/WebP)
    // apple-touch-icon typically has padding, making it ideal for logo display
    const commonPaths = ['/apple-touch-icon.png', '/logo.svg', '/logo.webp', '/favicon.svg', '/favicon.webp', '/logo.png']
    const imageHeaders = getBrowserHeaders()
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, url).href
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          headers: imageHeaders,
          signal: AbortSignal.timeout(10000), // 10 second timeout for logo checks
        })
        if (response.ok) {
          // Apple touch icon has highest priority due to padding
          let priority = testUrl.match(/apple-touch-icon/i) ? 11 : (testUrl.match(/\.(svg|webp)$/i) ? 9 : 6)
          logoCandidates.push({ url: testUrl, priority })
          break // Stop at first found
        }
      } catch {
        // Ignore failures on individual logo paths
      }
    }
    
    // 8. Try domain-based logo paths (e.g., tally.so/logo.svg, dub.co/logo.svg)
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace(/^www\./, '')
      const domainName = hostname.split('.')[0]
      const domainLogoPaths = [`/${domainName}-logo.svg`, `/${domainName}-logo.webp`, `/${domainName}-logo.png`]
      for (const path of domainLogoPaths) {
        try {
          const testUrl = new URL(path, url).href
          const response = await fetch(testUrl, { 
            method: 'HEAD',
            headers: imageHeaders,
            signal: AbortSignal.timeout(10000),
          })
          if (response.ok) {
            const priority = testUrl.match(/\.(svg|webp)$/i) ? 9 : 7
            logoCandidates.push({ url: testUrl, priority })
            break
          }
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
    
    // Select the best logo, avoiding text-based SVGs when possible
    if (logoCandidates.length > 0) {
      logoUrl = await selectBestLogo(logoCandidates) || null
    }
    
    // Extract screenshots
    const screenshotUrls: string[] = []
    const ogImages = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi)
    for (const match of ogImages) {
      const imgUrl = new URL(match[1], url).href
      if (imgUrl !== logoUrl && !screenshotUrls.includes(imgUrl)) {
        screenshotUrls.push(imgUrl)
      }
    }
    screenshotUrls.splice(4)
    
    return {
      name: name.slice(0, 40),
      tagline: tagline.slice(0, 70),
      description: description ? description.slice(0, 800) : null,
      url: url,
      logoUrl,
      screenshotUrls,
    }
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      throw new Error(`Request timeout: Website took too long to respond (>30s). The site may be slow or unreachable.`)
    }
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(`Network error: Could not connect to ${url}. Check if the URL is correct and the site is accessible.`)
    }
    // Re-throw with original message if already formatted
    if (error.message.includes('HTTP')) {
      throw error
    }
    throw new Error(`Failed to extract metadata: ${error.message}`)
  }
}

/**
 * Upload image to Vercel Blob if token is available
 */
async function uploadImageIfNeeded(imageUrl: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return imageUrl
  
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
    
    const blob = await response.blob()
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `seeded-products/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    
    const uploaded = await put(filename, blob, {
      access: "public",
      contentType: blob.type || `image/${extension}`,
    })
    
    return uploaded.url
  } catch {
    return imageUrl
  }
}

/**
 * Seed a single product (server action)
 */
export async function seedProductAction(
  url: string,
  categorySlugs: string[] = [],
  maxWords: number = 2
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can seed products")
  }

  // Validate URL
  if (!url.startsWith("https://")) {
    throw new Error("URL must start with https://")
  }

  // Check if product already exists
  const existing = await prismaAny.software.findUnique({
    where: { url },
  })

  if (existing) {
    throw new Error(`Product with URL ${url} already exists`)
  }

  // Extract metadata
  const productData = await extractProductMetadata(url, maxWords)

  // Get seeder user
  const seederUserId = session.user.id

  // Upload images
  let thumbnail: string | null = null
  if (productData.logoUrl) {
    thumbnail = await uploadImageIfNeeded(productData.logoUrl)
  }

  const screenshotUrls: string[] = []
  for (const screenshotUrl of productData.screenshotUrls) {
    const uploadedUrl = await uploadImageIfNeeded(screenshotUrl)
    screenshotUrls.push(uploadedUrl)
  }

  // Get category IDs
  const categoryIds: string[] = []
  if (categorySlugs.length > 0) {
    const categories = await prismaAny.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true },
    })
    categoryIds.push(...categories.map((c: { id: string }) => c.id))
  }

  // Get user info for maker field
  const seederUser = await prismaAny.user.findUnique({
    where: { id: seederUserId },
    select: { username: true, name: true },
  })

  // Generate slug from product name
  const { generateSlug } = await import("@/lib/slug")
  const slug = generateSlug(productData.name)

  // Create product
  const product = await prismaAny.software.create({
    data: {
      name: productData.name,
      slug, // Store slug for canonical URLs
      tagline: productData.tagline,
      description: productData.description,
      url: productData.url,
      thumbnail,
      maker: seederUser?.username || seederUser?.name || "Hobbyrider",
      makerId: seederUserId,
      ownershipStatus: "seeded",
      seededBy: seederUserId,
      categories: categoryIds.length > 0 ? {
        connect: categoryIds.map(id => ({ id })),
      } : undefined,
    },
  })

  // Add screenshots
  if (screenshotUrls.length > 0) {
    await prismaAny.productImage.createMany({
      data: screenshotUrls.map((url, index) => ({
        url,
        productId: product.id,
        order: index,
      })),
    })
  }

  // Revalidate pages
  const { getProductUrl } = await import("@/lib/slug")
  revalidatePath("/")
  revalidatePath(getProductUrl(product.slug, product.id))
  revalidatePath(`/product/${product.id}`) // Keep old path for backward compatibility

  return {
    success: true,
    productId: product.id,
    productName: product.name,
    url: product.url,
  }
}

/**
 * Seed multiple products (server action)
 */
export async function seedProductsAction(
  urls: string[],
  defaultCategorySlugs: string[] = [],
  maxWords: number = 2
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can seed products")
  }

  const results = []

  for (const url of urls) {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) continue

    try {
      const result = await seedProductAction(trimmedUrl, defaultCategorySlugs, maxWords)
      results.push({
        ...result,
        url: trimmedUrl, // Override with the trimmed URL
        success: true,
      })
    } catch (error: any) {
      results.push({
        url: trimmedUrl,
        success: false,
        error: error.message || "Unknown error",
      })
    }
  }

  return results
}
