/**
 * Script to fix product names and taglines for existing seeded products
 * 
 * Usage: npx tsx scripts/fix-product-names-taglines.ts [product-url]
 * 
 * If no URL provided, will fix all seeded products with poor names/taglines
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { extractBrandName, extractTagline, validateProductName, validateTagline } from "../lib/product-extraction"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

/**
 * Extract product metadata and fix name/tagline
 */
async function fixProductMetadata(url: string, currentName: string, currentTagline: string, maxWords: number = 2) {
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
      if (response.status === 403) {
        throw new Error(`HTTP ${response.status}: Forbidden - Website blocked the request. This site may have bot protection.`)
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    const baseUrl = new URL(url)
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    let rawTitle = titleMatch?.[1]?.trim() || baseUrl.hostname.replace(/^www\./, '')
    
    // Extract OG title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    if (ogTitleMatch?.[1]) {
      rawTitle = ogTitleMatch[1].trim()
    }
    
    // Extract description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const metaDescription = descMatch?.[1]?.trim() || null
    
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    const taglineText = ogDescMatch?.[1] || metaDescription || ""
    
    // Extract clean name and tagline
    const newName = extractBrandName(rawTitle, url, maxWords)
    const newTagline = extractTagline(taglineText, newName, url)
    
    // Validate
    const nameValidation = validateProductName(newName)
    const taglineValidation = validateTagline(newTagline, newName)
    
    const needsFix = 
      nameValidation.errors.length > 0 ||
      taglineValidation.errors.length > 0 ||
      newName !== currentName ||
      newTagline !== currentTagline
    
    return {
      newName,
      newTagline,
      needsFix,
      nameErrors: nameValidation.errors,
      taglineErrors: taglineValidation.errors,
    }
  } catch (error: any) {
    throw new Error(`Failed to extract metadata: ${error.message}`)
  }
}

async function fixProducts(specificUrl?: string) {
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

    console.log(`\n🔍 Found ${products.length} product(s) to check\n`)

    let fixedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name} (${product.url})`)
      
      try {
        const result = await fixProductMetadata(product.url, product.name, product.tagline, 2)
        
        if (result.needsFix && (result.newName !== product.name || result.newTagline !== product.tagline)) {
          await prisma.software.update({
            where: { id: product.id },
            data: {
              name: result.newName,
              tagline: result.newTagline,
            },
          })
          
          console.log(`   ✅ Fixed:`)
          if (result.newName !== product.name) {
            console.log(`      Name: "${product.name}" → "${result.newName}"`)
          }
          if (result.newTagline !== product.tagline) {
            console.log(`      Tagline: "${product.tagline}" → "${result.newTagline}"`)
          }
          fixedCount++
        } else {
          console.log(`   ℹ️  No changes needed`)
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

const url = process.argv[2]

if (url && !url.startsWith('https://')) {
  console.error("❌ URL must start with https://")
  process.exit(1)
}

fixProducts(url || undefined)
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
