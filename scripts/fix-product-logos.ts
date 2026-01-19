/**
 * Script to fix low-quality logos for existing products
 * 
 * Usage: 
 *   npx tsx scripts/fix-product-logos.ts                    # Fix all low-quality logos
 *   npx tsx scripts/fix-product-logos.ts https://example.com # Fix specific product
 *   npx tsx scripts/fix-product-logos.ts --force            # Force re-extract all logos
 *   npx tsx scripts/fix-product-logos.ts https://example.com --force # Force re-extract for one
 * 
 * Detection:
 * - Low-quality: .ico, 16x16, 32x32, favicon (unless SVG/WebP)
 * - Screenshots: URLs with "screenshot", "preview", "image", "photo", etc.
 * - User uploads: Vercel Blob uploads/ folder (might be screenshots)
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { selectBestLogo } from "../lib/logo-extraction"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

/**
 * Extract high-quality logo from website
 */
async function extractHighQualityLogo(url: string): Promise<string | null> {
  try {
    // Use realistic browser headers to avoid 403 Forbidden errors
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
    
    const response = await fetch(url, {
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
    
    if (!response.ok) {
      // For logo extraction, silently fail 403s (can't extract from protected sites)
      if (response.status === 403) {
        return null
      }
      return null
    }
    
    const html = await response.text()
    const logoCandidates: Array<{ url: string; priority: number }> = []
    
    // 1. Look for SVG logos (highest priority)
    const svgLogos = [
      ...html.matchAll(/<link[^>]*rel=["'][^"']*logo["'][^>]*href=["']([^"']+\.svg[^"']*)["']/gi),
      ...html.matchAll(/<link[^>]*rel=["'][^"']*icon["'][^>]*href=["']([^"']+\.svg[^"']*)["']/gi),
    ]
    for (const match of svgLogos) {
      logoCandidates.push({ url: new URL(match[1], url).href, priority: 10 })
    }
    
    // 2. Look for WebP logos
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
      if (iconUrl.match(/\.(svg|webp)$/i)) priority += 1
      logoCandidates.push({ url: iconUrl, priority })
    }
    
    // 5. OG image (if SVG/WebP) - but skip if it looks like a screenshot
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch?.[1]) {
      const ogImageUrl = new URL(ogImageMatch[1], url).href
      const lowerUrl = ogImageUrl.toLowerCase()
      // Skip if URL contains screenshot-related keywords
      if (!lowerUrl.match(/(screenshot|preview|image|photo|capture|thumbnail|banner|hero|header)/) &&
          ogImageUrl.match(/\.(svg|webp)$/i)) {
        logoCandidates.push({ url: ogImageUrl, priority: 8 })
      }
    }
    
    // 6. Try common logo paths (prioritize apple-touch-icon for padding, then SVG/WebP)
    const commonPaths = ['/apple-touch-icon.png', '/logo.svg', '/logo.webp', '/favicon.svg', '/favicon.webp', '/logo.png']
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, url).href
        const response = await fetch(testUrl, { method: 'HEAD' })
        if (response.ok) {
          // Apple touch icon has highest priority due to padding
          let priority = testUrl.match(/apple-touch-icon/i) ? 11 : (testUrl.match(/\.(svg|webp)$/i) ? 9 : 6)
          logoCandidates.push({ url: testUrl, priority })
          break // Stop at first found
        }
      } catch {
        // Ignore
      }
    }
    
    // 7. Try domain-based logo paths (e.g., tally.so/logo.svg, dub.co/logo.svg)
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace(/^www\./, '')
      const domainName = hostname.split('.')[0]
      const domainLogoPaths = [`/${domainName}-logo.svg`, `/${domainName}-logo.webp`, `/${domainName}-logo.png`]
      for (const path of domainLogoPaths) {
        try {
          const testUrl = new URL(path, url).href
          const response = await fetch(testUrl, { method: 'HEAD' })
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
      return await selectBestLogo(logoCandidates)
    }
    
    return null
  } catch (error: any) {
    console.error(`Failed to extract logo from ${url}: ${error.message}`)
    return null
  }
}

/**
 * Check if logo URL is low quality or a screenshot
 */
function isLowQualityLogo(logoUrl: string | null): boolean {
  if (!logoUrl) return true
  const lower = logoUrl.toLowerCase()
  
  // Check for low-quality formats
  if (lower.includes('.ico') || 
      lower.includes('16x16') ||
      lower.includes('32x32') ||
      (lower.includes('favicon') && !lower.match(/\.(svg|webp)$/i))) {
    return true
  }
  
  // Check if it's likely a screenshot (not a logo)
  const screenshotKeywords = [
    'screenshot', 'preview', 'image', 'photo', 'picture', 
    'capture', 'thumbnail', 'banner', 'hero', 'header',
    'og-image', 'twitter-card', 'meta-image', 'social-image'
  ]
  for (const keyword of screenshotKeywords) {
    if (lower.includes(keyword) && !lower.match(/logo.*\.(svg|webp|png)$/i)) {
      return true
    }
  }
  
  // Check if it's stored in Vercel Blob uploads (might be user-uploaded screenshots)
  // Even seeded-products might contain screenshots - check the filename
  if (lower.includes('blob.vercel-storage.com')) {
    // Check if filename suggests screenshot
    if (lower.match(/(screenshot|preview|image|photo|capture|thumbnail|banner|hero|header|ze4an|r717wq|bbbyqs|vroszf|vmn8tb|avc2de)/)) {
      return true
    }
    // If it's in uploads/ (not seeded-products), likely user upload (screenshot)
    if (lower.includes('/uploads/')) {
      return true
    }
    // If it's a JPG in seeded-products, might be a screenshot (logos usually PNG/SVG/WebP)
    if (lower.includes('/seeded-products/') && lower.match(/\.jpg|jpeg$/)) {
      return true
    }
  }
  
  // Check if URL suggests it's not a logo
  // Common logo paths should have "logo", "icon", "brand", "favicon" in them
  const isLogoPath = lower.match(/\/(logo|icon|brand|favicon|mark|symbol)/)
  const isRootPath = lower.match(/\.(svg|webp)$/) // SVG/WebP in root might be logos
  const isKnownGoodDomain = lower.match(/\.(svg|webp)$/) || lower.match(/(tally|cal|leadverse|posthog|tasklanes|forgetbill|dub|vibeappscanner)\.(com|app|ai|co)\//)
  
  // If it's PNG/JPG without logo-related keywords and not a known good domain, likely screenshot
  if (!isLogoPath && !isRootPath && !isKnownGoodDomain && 
      lower.match(/\.(png|jpg|jpeg)$/)) {
    // Conservative: prefer re-extraction for unclear cases
    return true
  }
  
  return false
}

async function fixProductLogos(specificUrl?: string, force: boolean = false) {
  try {
    const products = specificUrl
      ? await prisma.software.findMany({ where: { url: specificUrl } })
      : await prisma.software.findMany({
          where: {
            OR: [
              { ownershipStatus: "seeded" },
              { seededBy: { not: null } },
            ],
          },
        })

    if (products.length === 0) {
      console.log("No products found to fix")
      return
    }

    console.log(`\n🔍 Found ${products.length} product(s) to check${force ? ' (FORCE MODE: re-extracting all)' : ''}\n`)

    let fixedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const product of products) {
      const currentLogo = product.thumbnail
      const shouldFix = force || !currentLogo || isLowQualityLogo(currentLogo)

      if (!shouldFix) {
        console.log(`⏭️  Skipping ${product.name} - logo looks good: ${currentLogo}`)
        skippedCount++
        continue
      }

      console.log(`\n📦 Processing: ${product.name} (${product.url})`)
      console.log(`   Current logo: ${currentLogo || "None"}`)

      try {
        const newLogo = await extractHighQualityLogo(product.url)

        if (newLogo && newLogo !== currentLogo) {
          await prisma.software.update({
            where: { id: product.id },
            data: { thumbnail: newLogo },
          })

          const changedNote = currentLogo && currentLogo.match(/\.svg$/i) && !newLogo.match(/\.svg$/i)
            ? ' (replaced text-based SVG with vector/PNG)'
            : ''
          console.log(`   ✅ Updated to: ${newLogo}${changedNote}`)
          fixedCount++
        } else if (!newLogo) {
          console.log(`   ⚠️  Could not find a better logo`)
          errorCount++
        } else {
          console.log(`   ℹ️  Logo unchanged`)
          skippedCount++
        }
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`)
        errorCount++
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   ✅ Fixed: ${fixedCount}`)
    console.log(`   ⏭️  Skipped: ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`)
    throw error
  }
}

const args = process.argv.slice(2)
const url = args.find(arg => arg.startsWith('https://'))
const force = args.includes('--force') || args.includes('-f')

if (url && !url.startsWith('https://')) {
  console.error("❌ URL must start with https://")
  process.exit(1)
}

if (force) {
  console.log("⚠️  FORCE MODE: Re-extracting logos for all products, even if they look good")
}

fixProductLogos(url || undefined, force)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
