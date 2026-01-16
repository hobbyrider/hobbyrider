#!/usr/bin/env tsx
/**
 * Migration script to upload local user profile images to Vercel Blob
 * 
 * This script migrates User.image fields that use local paths
 * 
 * Usage:
 *   npx tsx scripts/migrate-user-images-to-blob.ts
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

async function migrateUserImages() {
  // Dynamically import prisma AFTER env vars are loaded
  const { prisma } = await import("../lib/prisma")

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is not set!")
    process.exit(1)
  }

  console.log("🔍 Finding users with local profile image paths...")

  // Find all users with local image paths
  const users = await prisma.user.findMany({
    where: {
      image: {
        startsWith: "/uploads/",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (users.length === 0) {
    console.log("✅ No local user images found. All user images are already using cloud storage!")
    process.exit(0)
  }

  console.log(`📦 Found ${users.length} user(s) with local profile images\n`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ id: string; name: string; error: string }> = []

  for (const user of users) {
    if (!user.image) continue

    const localPath = path.join(process.cwd(), "public", user.image)
    const filename = path.basename(user.image)

    console.log(`📤 Migrating profile image: ${user.image}`)
    console.log(`   User: ${user.name || user.email} (${user.id})`)

    try {
      // Check if file exists locally
      if (!existsSync(localPath)) {
        const error = `File not found: ${localPath}`
        console.error(`   ❌ ${error}`)
        errors.push({ id: user.id, name: user.name || user.email || "", error })
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
      await prisma.user.update({
        where: { id: user.id },
        data: { image: blob.url },
      })

      console.log(`   ✅ Migrated to: ${blob.url}\n`)
      successCount++
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error"
      console.error(`   ❌ Error: ${errorMsg}\n`)
      errors.push({ id: user.id, name: user.name || user.email || "", error: errorMsg })
      errorCount++
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 Migration Summary")
  console.log("=".repeat(60))
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📦 Total: ${users.length}`)

  if (errors.length > 0) {
    console.log("\n❌ Errors:")
    errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`)
    })
  }

  if (successCount > 0) {
    console.log("\n✅ Migration complete! User profile images are now stored in Vercel Blob.")
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

migrateUserImages().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
