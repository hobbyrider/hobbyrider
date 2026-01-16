#!/usr/bin/env tsx
/**
 * Script to check for images that might still have local paths or are missing
 */

// Load environment variables from .env.local
import { config } from "dotenv"
import { resolve } from "path"
import { existsSync } from "fs"

const envLocalPath = resolve(process.cwd(), ".env.local")
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
  console.log("✅ Loaded .env.local")
}
config()

async function checkImages() {
  const { prisma } = await import("../lib/prisma")

  console.log("🔍 Checking for local image paths...\n")

  // Check product thumbnails
  const productsWithLocalThumbnails = await prisma.software.findMany({
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

  // Check product images
  const localProductImages = await prisma.productImage.findMany({
    where: {
      url: {
        startsWith: "/uploads/",
      },
    },
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
  })

  // Check user images
  const usersWithLocalImages = await prisma.user.findMany({
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

  // Summary
  console.log("📊 Image Check Results:")
  console.log("=".repeat(60))
  console.log(`Product thumbnails with local paths: ${productsWithLocalThumbnails.length}`)
  if (productsWithLocalThumbnails.length > 0) {
    productsWithLocalThumbnails.forEach((p) => {
      console.log(`  - ${p.name}: ${p.thumbnail}`)
    })
  }

  console.log(`\nProduct images with local paths: ${localProductImages.length}`)
  if (localProductImages.length > 0) {
    localProductImages.forEach((img) => {
      console.log(`  - ${img.product.name}: ${img.url}`)
    })
  }

  console.log(`\nUser profile images with local paths: ${usersWithLocalImages.length}`)
  if (usersWithLocalImages.length > 0) {
    usersWithLocalImages.forEach((u) => {
      console.log(`  - ${u.name || u.email}: ${u.image}`)
    })
  }

  // Check for Vercel Blob URLs
  console.log("\n\n📦 Checking current image URLs (first 3 products):")
  console.log("=".repeat(60))
  const sampleProducts = await prisma.software.findMany({
    take: 3,
    select: {
      name: true,
      thumbnail: true,
    },
  })

  sampleProducts.forEach((p) => {
    console.log(`\n${p.name}:`)
    if (p.thumbnail) {
      const isBlob = p.thumbnail.includes("blob.vercel-storage.com")
      const isLocal = p.thumbnail.startsWith("/uploads/")
      console.log(`  Thumbnail: ${p.thumbnail}`)
      console.log(`  Status: ${isBlob ? "✅ Vercel Blob" : isLocal ? "❌ Local path" : "⚠️  Other"}`)
    } else {
      console.log(`  Thumbnail: (none)`)
    }
  })

  process.exit(0)
}

checkImages().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
