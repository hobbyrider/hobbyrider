#!/usr/bin/env tsx
/**
 * Migration script to upload local thumbnails to Vercel Blob
 * 
 * This script migrates Software.thumbnail fields that use local paths
 * 
 * Usage:
 *   npx tsx scripts/migrate-thumbnails-to-blob.ts
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

async function migrateThumbnails() {
  // Dynamically import prisma AFTER env vars are loaded
  const { prisma } = await import("../lib/prisma")
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set!")
    process.exit(1)
  }

  console.log("🔍 Finding products with local thumbnail paths...")

  // Find all products with local thumbnail paths
  const products = await prisma.software.findMany({
    where: {
      thumbnail: {
        startsWith: "/uploads/",
      },
    },
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
  })

  if (products.length === 0) {
    console.log("✅ No local thumbnails found. All thumbnails are already using cloud storage!")
    process.exit(0)
  }

  console.log(`📦 Found ${products.length} product(s) with local thumbnails\n`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ id: string; name: string; error: string }> = []

  for (const product of products) {
    if (!product.thumbnail) continue

    const localPath = path.join(process.cwd(), "public", product.thumbnail)
    const filename = path.basename(product.thumbnail)

    console.log(`📤 Migrating thumbnail: ${product.thumbnail}`)
    console.log(`   Product: ${product.name} (${product.id})`)

    try {
      // Check if file exists locally
      if (!existsSync(localPath)) {
        const error = `File not found: ${localPath}`
        console.error(`   ❌ ${error}`)
        errors.push({ id: product.id, name: product.name, error })
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
      await prisma.software.update({
        where: { id: product.id },
        data: { thumbnail: blob.url },
      })

      console.log(`   ✅ Migrated to: ${blob.url}\n`)
      successCount++
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error"
      console.error(`   ❌ Error: ${errorMsg}\n`)
      errors.push({ id: product.id, name: product.name, error: errorMsg })
      errorCount++
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 Migration Summary")
  console.log("=".repeat(60))
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📦 Total: ${products.length}`)

  if (errors.length > 0) {
    console.log("\n❌ Errors:")
    errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`)
    })
  }

  if (successCount > 0) {
    console.log("\n✅ Migration complete! Thumbnails are now stored in Vercel Blob.")
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

migrateThumbnails().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
