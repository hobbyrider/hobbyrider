#!/usr/bin/env tsx
/**
 * Migration script to upload local images to Vercel Blob
 * 
 * This script:
 * 1. Finds all ProductImage records with local paths (/uploads/...)
 * 2. Reads the image files from local filesystem
 * 3. Uploads them to Vercel Blob
 * 4. Updates the database with new Vercel Blob URLs
 * 
 * Usage:
 *   npx tsx scripts/migrate-images-to-blob.ts
 * 
 * Requirements:
 *   - BLOB_READ_WRITE_TOKEN must be set in environment
 *   - Local images must exist in public/uploads/
 *   - DATABASE_URL must point to production database
 */

// Load environment variables from .env.local BEFORE any other imports
// This must happen before importing prisma, which reads DATABASE_URL at module load time
import { config } from "dotenv"
import { resolve } from "path"
import { existsSync } from "fs"

const envLocalPath = resolve(process.cwd(), ".env.local")
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
  console.log("✅ Loaded .env.local")
} else {
  console.warn("⚠️  .env.local not found, using system environment variables")
}
config() // Also load .env if it exists

// Now we can safely import modules that depend on environment variables
import { put } from "@vercel/blob"
import { readFile } from "node:fs/promises"
import path from "node:path"

async function migrateImages() {
  // Dynamically import prisma AFTER env vars are loaded
  const { prisma } = await import("../lib/prisma")
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set!")
    console.error("   Get it from Vercel dashboard → Settings → Environment Variables")
    process.exit(1)
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set!")
    process.exit(1)
  }

  console.log("🔍 Finding images with local paths...")

  // Find all images with local paths
  const localImages = await prisma.productImage.findMany({
    where: {
      url: {
        startsWith: "/uploads/",
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (localImages.length === 0) {
    console.log("✅ No local images found. All images are already using cloud storage!")
    process.exit(0)
  }

  console.log(`📦 Found ${localImages.length} local image(s) to migrate\n`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ id: string; url: string; error: string }> = []

  for (const image of localImages) {
    const localPath = path.join(process.cwd(), "public", image.url)
    const filename = path.basename(image.url)

    console.log(`📤 Migrating: ${image.url}`)
    console.log(`   Product: ${image.product.name} (${image.product.id})`)

    try {
      // Check if file exists locally
      if (!existsSync(localPath)) {
        const error = `File not found: ${localPath}`
        console.error(`   ❌ ${error}`)
        errors.push({ id: image.id, url: image.url, error })
        errorCount++
        continue
      }

      // Read file from local filesystem
      const fileBuffer = await readFile(localPath)
      const file = new File([fileBuffer], filename, {
        type: `image/${path.extname(filename).slice(1) || "jpg"}`,
      })

      // Upload to Vercel Blob
      const blobPath = `uploads/${Date.now()}-${filename}`
      const blob = await put(blobPath, file, {
        access: "public",
        contentType: file.type,
      })

      // Update database with new URL
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: blob.url },
      })

      console.log(`   ✅ Migrated to: ${blob.url}\n`)
      successCount++
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error"
      console.error(`   ❌ Error: ${errorMsg}\n`)
      errors.push({ id: image.id, url: image.url, error: errorMsg })
      errorCount++
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 Migration Summary")
  console.log("=".repeat(60))
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📦 Total: ${localImages.length}`)

  if (errors.length > 0) {
    console.log("\n❌ Errors:")
    errors.forEach(({ url, error }) => {
      console.log(`   - ${url}: ${error}`)
    })
  }

  if (successCount > 0) {
    console.log("\n✅ Migration complete! Images are now stored in Vercel Blob.")
    console.log("   They will work in production now.")
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

// Run migration
migrateImages().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
