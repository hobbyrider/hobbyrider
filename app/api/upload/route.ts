import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"

export const runtime = "nodejs"

/**
 * Image optimization settings
 * - Max dimensions for thumbnails and gallery images
 * - WebP format for better compression
 * - Quality 80-85% for balance between size and quality
 */
const IMAGE_CONFIG = {
  thumbnail: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
  },
  gallery: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
  },
} as const

/**
 * Process and optimize an image
 * - Resizes to max dimensions (maintains aspect ratio)
 * - Converts to WebP format for better compression
 * - Optimizes quality for file size vs quality balance
 */
async function optimizeImage(
  buffer: Buffer,
  imageType: "thumbnail" | "gallery" = "gallery"
): Promise<{ buffer: Buffer; contentType: string; originalFormat?: string }> {
  const config = IMAGE_CONFIG[imageType]
  const image = sharp(buffer)
  const metadata = await image.metadata()

  // Determine if we need to resize
  const needsResize =
    (metadata.width && metadata.width > config.maxWidth) ||
    (metadata.height && metadata.height > config.maxHeight)

  let processedImage = image

  // Resize if needed (maintains aspect ratio)
  if (needsResize) {
    processedImage = processedImage.resize(config.maxWidth, config.maxHeight, {
      fit: "inside", // Maintain aspect ratio, fit within bounds
      withoutEnlargement: true, // Don't enlarge if image is smaller
    })
  }

  // Convert to WebP format with optimization
  const webpBuffer = await processedImage
    .webp({ quality: config.quality, effort: 4 }) // effort 4 = good balance of speed/compression
    .toBuffer()

  // Store original format for reference
  const originalFormat = metadata.format

  return {
    buffer: webpBuffer,
    contentType: "image/webp",
    originalFormat,
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const isProd = process.env.NODE_ENV === "production"

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const singleFile = formData.get("file") as File | null

    // Support both single file and multiple files
    const filesToProcess = files.length > 0 ? files : singleFile ? [singleFile] : []

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of filesToProcess) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        errors.push(`"${file.name}" is not an image`)
        continue
      }

      // Validate file size (max 10MB before optimization)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`"${file.name}" is too large (max 10MB)`)
        continue
      }

      try {
        // Read file buffer
        const originalBuffer = Buffer.from(await file.arrayBuffer())

        // Determine image type based on upload context
        // For now, use 'gallery' as default (can be made configurable via formData)
        // Thumbnails can be detected by file name pattern or separate endpoint
        const imageType = file.name.toLowerCase().includes("thumbnail") ? "thumbnail" : "gallery"

        // Optimize image (resize, convert to WebP)
        const { buffer: optimizedBuffer, contentType } = await optimizeImage(
          originalBuffer,
          imageType
        )

        // Generate unique filename with .webp extension
        const basename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.webp`

        // Prefer Vercel Blob if token is configured, otherwise fallback to local in dev
        if (token) {
          try {
            const filename = `uploads/${basename}`
            const blob = await put(filename, optimizedBuffer, {
              access: "public",
              contentType, // image/webp
            })

            uploadedUrls.push(blob.url)
          } catch (e: any) {
            console.error("Blob upload error:", e)
            errors.push(`Failed to upload "${file.name}"`)
          }
        } else if (!isProd) {
          try {
            const uploadsDir = path.join(process.cwd(), "public", "uploads")
            await mkdir(uploadsDir, { recursive: true })
            const diskPath = path.join(uploadsDir, basename)
            await writeFile(diskPath, optimizedBuffer)
            uploadedUrls.push(`/uploads/${basename}`)
          } catch (e: any) {
            console.error("Local upload error:", e)
            errors.push(`Failed to upload "${file.name}" locally`)
          }
        } else {
          return NextResponse.json(
            {
              error:
                "Missing BLOB_READ_WRITE_TOKEN. Configure it in production to enable uploads.",
            },
            { status: 500 }
          )
        }
      } catch (e: any) {
        console.error(`Image processing error for "${file.name}":`, e)
        // If image processing fails, try uploading original as fallback
        try {
          const extension = file.name.split(".").pop() || "jpg"
          const basename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`

          if (token) {
            const filename = `uploads/${basename}`
            const blob = await put(filename, file, {
              access: "public",
              contentType: file.type,
            })
            uploadedUrls.push(blob.url)
          } else if (!isProd) {
            const uploadsDir = path.join(process.cwd(), "public", "uploads")
            await mkdir(uploadsDir, { recursive: true })
            const buffer = Buffer.from(await file.arrayBuffer())
            const diskPath = path.join(uploadsDir, basename)
            await writeFile(diskPath, buffer)
            uploadedUrls.push(`/uploads/${basename}`)
          }
          // Log warning but continue with original
          console.warn(`Image optimization failed for "${file.name}", uploaded original instead`)
        } catch (fallbackError: any) {
          console.error("Fallback upload error:", fallbackError)
          errors.push(`Failed to upload "${file.name}"`)
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: errors[0] || "No valid images uploaded" },
        { status: 400 }
      )
    }

    // Return single URL for backward compatibility, or array for multiple files
    if (filesToProcess.length === 1) {
      return NextResponse.json({ url: uploadedUrls[0], errors: errors.length ? errors : undefined })
    } else {
      return NextResponse.json({ urls: uploadedUrls, errors: errors.length ? errors : undefined })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    )
  }
}
