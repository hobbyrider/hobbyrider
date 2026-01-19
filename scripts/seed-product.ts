/**
 * Script to seed a product into Hobbyrider
 * 
 * Usage: 
 *   npx tsx scripts/seed-product.ts <product-url> [category-slug-1] [category-slug-2] ... [--max-words=N]
 * 
 * Examples:
 *   npx tsx scripts/seed-product.ts https://example.com
 *   npx tsx scripts/seed-product.ts https://example.com saas productivity
 *   npx tsx scripts/seed-product.ts https://example.com --max-words=3
 * 
 * Options:
 *   --max-words=N    Maximum number of words in product name (default: 2)
 * 
 * This script will:
 * 1. Extract product metadata from the URL
 * 2. Find an admin user to use as the seeder
 * 3. Create a seeded product with proper ownership status
 * 4. Add logo and screenshots
 * 5. Assign categories (optional)
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { put } from "@vercel/blob"
import { extractBrandName, extractTagline } from "../lib/product-extraction"

// Initialize Prisma with the same pattern as lib/prisma.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

interface ProductData {
  name: string
  tagline: string
  description: string | null
  url: string
  logoUrl: string | null
  screenshotUrls: string[]
  categorySlugs?: string[]
}

/**
 * Extract product metadata from a website URL
 */
async function extractProductMetadata(url: string, maxWords: number = 2): Promise<ProductData> {
  console.log(`🔍 Fetching ${url}...`)
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
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
    
    // Description: use meta description or create from tagline
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
    
    // 3. Check for apple-touch-icon (usually high quality PNG)
    const appleTouchIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    if (appleTouchIcon?.[1]) {
      const iconUrl = new URL(appleTouchIcon[1], url).href
      const priority = iconUrl.match(/\.(svg|webp)$/i) ? 8 : 7
      logoCandidates.push({ url: iconUrl, priority })
    }
    
    // 4. Check for icon with sizes (prefer larger sizes)
    const sizedIcons = html.matchAll(/<link[^>]*rel=["'][^"']*icon["'][^>]*sizes=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)
    for (const match of sizedIcons) {
      const sizes = match[1]
      const iconUrl = new URL(match[2], url).href
      // Higher priority for larger sizes (192x192, 512x512)
      let priority = 5
      if (sizes.includes('512') || sizes.includes('256')) priority = 6
      else if (sizes.includes('192') || sizes.includes('180')) priority = 5
      // Prefer SVG/WebP
      if (iconUrl.match(/\.(svg|webp)$/i)) priority += 2
      logoCandidates.push({ url: iconUrl, priority })
    }
    
    // 5. OG image (if it looks like a logo, not a screenshot)
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch?.[1]) {
      const ogImageUrl = new URL(ogImageMatch[1], url).href
      // OG images are often screenshots, so lower priority unless they're SVG/WebP
      const priority = ogImageUrl.match(/\.(svg|webp)$/i) ? 8 : 4
      logoCandidates.push({ url: ogImageUrl, priority })
    }
    
    // 6. Standard favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["']/i)
    if (faviconMatch?.[1]) {
      const faviconUrl = new URL(faviconMatch[1], url).href
      const priority = faviconUrl.match(/\.(svg|webp)$/i) ? 7 : 3
      logoCandidates.push({ url: faviconUrl, priority })
    }
    
    // 7. Try common logo paths
    const commonPaths = ['/logo.svg', '/logo.webp', '/logo.png', '/favicon.svg', '/favicon.webp']
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, url).href
        const response = await fetch(testUrl, { method: 'HEAD' })
        if (response.ok) {
          const priority = testUrl.match(/\.(svg|webp)$/i) ? 9 : 6
          logoCandidates.push({ url: testUrl, priority })
          break // Stop at first found
        }
      } catch {
        // Ignore
      }
    }
    
    // Select the highest priority logo
    if (logoCandidates.length > 0) {
      logoCandidates.sort((a, b) => b.priority - a.priority)
      logoUrl = logoCandidates[0].url
    }
    
    // Extract screenshots (OG images, Twitter cards, or look for common image patterns)
    const screenshotUrls: string[] = []
    
    // Get all OG images (some sites have multiple)
    const ogImages = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi)
    for (const match of ogImages) {
      const imgUrl = new URL(match[1], url).href
      if (imgUrl !== logoUrl && !screenshotUrls.includes(imgUrl)) {
        screenshotUrls.push(imgUrl)
      }
    }
    
    // Try Twitter card images
    const twitterImageMatches = html.matchAll(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/gi)
    for (const match of twitterImageMatches) {
      const imgUrl = new URL(match[1], url).href
      if (imgUrl !== logoUrl && !screenshotUrls.includes(imgUrl)) {
        screenshotUrls.push(imgUrl)
      }
    }
    
    // If we don't have enough screenshots, try to find product/marketing images
    if (screenshotUrls.length < 2) {
      // Look for common image selectors in meta tags
      const imageMatches = html.matchAll(/<meta\s+property=["']og:image:url["']\s+content=["']([^"']+)["']/gi)
      for (const match of imageMatches) {
        const imgUrl = new URL(match[1], url).href
        if (imgUrl !== logoUrl && !screenshotUrls.includes(imgUrl)) {
          screenshotUrls.push(imgUrl)
        }
      }
    }
    
    // If still no screenshots, try looking for common screenshot/gallery patterns in HTML
    // (e.g., img tags with src attributes that look like screenshots)
    if (screenshotUrls.length === 0) {
      // Look for img tags with common screenshot class names or alt text
      const imgMatches = html.matchAll(/<img[^>]*(?:class=["'][^"']*screenshot[^"']*["']|alt=["'][^"']*screenshot[^"']*["'])[^>]*src=["']([^"']+)["']/gi)
      for (const match of imgMatches) {
        try {
          const imgUrl = new URL(match[1], url).href
          if (imgUrl !== logoUrl && !screenshotUrls.includes(imgUrl)) {
            screenshotUrls.push(imgUrl)
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    // Limit to 4 screenshots
    screenshotUrls.splice(4)
    
    return {
      name: sanitizeText(name, 40),
      tagline: sanitizeText(tagline, 70),
      description: description ? sanitizeText(description, 800) : null,
      url: url,
      logoUrl,
      screenshotUrls,
    }
  } catch (error: any) {
    throw new Error(`Failed to extract metadata: ${error.message}`)
  }
}

/**
 * Sanitize text (remove HTML tags, limit length)
 */
function sanitizeText(text: string, maxLength: number): string {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, "")
  // Decode HTML entities (basic)
  cleaned = cleaned.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
  // Trim and limit
  cleaned = cleaned.trim().slice(0, maxLength)
  return cleaned
}

/**
 * Download and upload image to Vercel Blob if BLOB_READ_WRITE_TOKEN is available
 * Otherwise, return the original URL
 */
async function uploadImageIfNeeded(imageUrl: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  
  if (!token) {
    console.log(`  ⚠️  No BLOB_READ_WRITE_TOKEN found, using original URL: ${imageUrl}`)
    return imageUrl
  }
  
  try {
    console.log(`  📤 Uploading ${imageUrl} to Vercel Blob...`)
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const blob = await response.blob()
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `seeded-products/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    
    const uploaded = await put(filename, blob, {
      access: "public",
      contentType: blob.type || `image/${extension}`,
    })
    
    console.log(`  ✅ Uploaded to: ${uploaded.url}`)
    return uploaded.url
  } catch (error: any) {
    console.log(`  ⚠️  Failed to upload image, using original URL: ${error.message}`)
    return imageUrl
  }
}

/**
 * Find or get an admin user to use as the seeder
 */
async function getSeederUser(): Promise<string> {
  // Find first admin user
  const admin = await prisma.user.findFirst({
    where: { isAdmin: true },
    select: { id: true, email: true },
  })
  
  if (!admin) {
    throw new Error(
      "No admin user found. Please create an admin user first:\n" +
      "  1. Sign up/login to the app\n" +
      "  2. Run: npx tsx scripts/set-admin.ts <your-email>"
    )
  }
  
  console.log(`👤 Using admin user: ${admin.email} (${admin.id})`)
  return admin.id
}

/**
 * Ensure categories exist and return their IDs
 */
async function getCategoryIds(categorySlugs: string[]): Promise<string[]> {
  if (categorySlugs.length === 0) return []
  
  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  })
  
  const foundSlugs = categories.map(c => c.slug)
  const missingSlugs = categorySlugs.filter(slug => !foundSlugs.includes(slug))
  
  if (missingSlugs.length > 0) {
    console.log(`⚠️  Warning: Categories not found: ${missingSlugs.join(", ")}`)
    console.log(`   Available categories: SaaS, Mobile App, Developer Tools, AI Tools, Design Tools, Productivity, Marketing, E-commerce, Education, Entertainment`)
  }
  
  return categories.map(c => c.id)
}

/**
 * Main function to seed a product
 */
async function seedProduct(url: string, categorySlugs: string[] = [], maxWords: number = 2) {
  try {
    console.log(`\n🌱 Seeding product: ${url}\n`)
    
    // Validate URL
    if (!url.startsWith("https://")) {
      throw new Error("URL must start with https://")
    }
    
    // Warn if URL is longer than the UI limit (40 chars), but allow it for seed script
    if (url.length > 40) {
      console.log(`⚠️  Warning: URL is ${url.length} characters (UI limit is 40)`)
      console.log(`   The product will be created, but may need to be edited in the UI later.`)
    }
    
    // Check if product already exists
    const existing = await prisma.software.findUnique({
      where: { url },
    })
    
    if (existing) {
      throw new Error(`Product with URL ${url} already exists (ID: ${existing.id})`)
    }
    
    // Extract metadata
    const productData = await extractProductMetadata(url, maxWords)
    console.log(`✅ Extracted metadata:`)
    console.log(`   Name: ${productData.name}`)
    console.log(`   Tagline: ${productData.tagline}`)
    console.log(`   Description: ${productData.description ? productData.description.substring(0, 60) + "..." : "None"}`)
    console.log(`   Logo: ${productData.logoUrl || "None"}`)
    console.log(`   Screenshots: ${productData.screenshotUrls.length}`)
    
    // Get seeder user
    const seederUserId = await getSeederUser()
    
    // Upload images if needed
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
    const categoryIds = await getCategoryIds(categorySlugs)
    
    // Get user info for maker field (backward compatibility)
    const seederUser = await prisma.user.findUnique({
      where: { id: seederUserId },
      select: { username: true, name: true },
    })
    
    // Create product
    console.log(`\n📦 Creating product in database...`)
    const product = await prisma.software.create({
      data: {
        name: productData.name,
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
    
    console.log(`✅ Product created: ${product.id}`)
    
    // Add screenshots
    if (screenshotUrls.length > 0) {
      console.log(`\n📸 Adding ${screenshotUrls.length} screenshot(s)...`)
      await prisma.productImage.createMany({
        data: screenshotUrls.map((url, index) => ({
          url,
          productId: product.id,
          order: index,
        })),
      })
      console.log(`✅ Screenshots added`)
    }
    
    console.log(`\n🎉 Product seeded successfully!`)
    console.log(`\n   View at: /product/${product.id}`)
    console.log(`   URL: ${url}`)
    console.log(`   Status: Seeded by Hobbyrider`)
    
    return product.id
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`)
    throw error
  }
}

// Main execution
const args = process.argv.slice(2)

// Check if --file flag is provided
const fileIndex = args.findIndex(arg => arg === '--file' || arg === '-f')
const filePath = fileIndex !== -1 ? args[fileIndex + 1] : null

// Parse arguments
let urls: string[] = []
let categorySlugs: string[] = []
let maxWords = 2 // Default to 2 words

if (filePath) {
  // Bulk mode: read URLs from file
  const fs = require('fs')
  const path = require('path')
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    urls = fileContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.startsWith('https://'))
    
    if (urls.length === 0) {
      console.error(`❌ No valid URLs found in file: ${filePath}`)
      process.exit(1)
    }
    
    console.log(`📄 Found ${urls.length} URL(s) in file: ${filePath}`)
  } catch (error: any) {
    console.error(`❌ Failed to read file: ${error.message}`)
    process.exit(1)
  }
  
  // Parse remaining arguments for categories and options
  const remainingArgs = args.filter((arg, index) => index < fileIndex || index > fileIndex + 1)
  for (const arg of remainingArgs) {
    if (arg.startsWith('--max-words=')) {
      const value = parseInt(arg.split('=')[1], 10)
      if (!isNaN(value) && value > 0) {
        maxWords = value
      }
    } else if (!arg.startsWith('--')) {
      categorySlugs.push(arg)
    }
  }
} else {
  // Single URL mode (original behavior)
  let url: string | undefined
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg.startsWith('--max-words=')) {
      const value = parseInt(arg.split('=')[1], 10)
      if (!isNaN(value) && value > 0) {
        maxWords = value
      } else {
        console.error(`⚠️  Invalid --max-words value: ${arg.split('=')[1]}, using default (2)`)
      }
    } else if (arg.startsWith('--')) {
      console.error(`⚠️  Unknown flag: ${arg}`)
    } else if (!url) {
      url = arg
    } else {
      categorySlugs.push(arg)
    }
  }
  
  if (!url) {
    console.error("❌ Please provide a product URL or use --file option")
    console.log("\nUsage:")
    console.log("  # Single URL:")
    console.log("  npx tsx scripts/seed-product.ts <product-url> [category-slug-1] [category-slug-2] ... [--max-words=N]")
    console.log("\n  # Bulk from file:")
    console.log("  npx tsx scripts/seed-product.ts --file urls.txt [category-slug-1] ... [--max-words=N]")
    console.log("\nExamples:")
    console.log("  npx tsx scripts/seed-product.ts https://example.com")
    console.log("  npx tsx scripts/seed-product.ts https://example.com saas productivity")
    console.log("  npx tsx scripts/seed-product.ts --file products.txt saas")
    console.log("  npx tsx scripts/seed-product.ts --file products.txt --max-words=3")
    process.exit(1)
  }
  
  urls = [url]
}

console.log(`📝 Max words for product name: ${maxWords}`)
if (categorySlugs.length > 0) {
  console.log(`📁 Categories: ${categorySlugs.join(', ')}`)
}

// Seed all URLs
let successCount = 0
let errorCount = 0

try {
  for (const url of urls) {
    try {
      await seedProduct(url, categorySlugs, maxWords)
      successCount++
    } catch (error: any) {
      console.error(`❌ Failed to seed ${url}: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n✅ Successfully seeded: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount}`)
  }
} finally {
  await prisma.$disconnect()
  process.exit(errorCount > 0 ? 1 : 0)
}
