import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

export const runtime = "nodejs"

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

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`"${file.name}" is too large (max 10MB)`)
        continue
      }

      // Generate unique filename
      const extension = file.name.split(".").pop() || "jpg"
      const basename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${extension}`

      // Prefer Vercel Blob if token is configured, otherwise fallback to local in dev
      if (token) {
        try {
          const filename = `uploads/${basename}`
          const blob = await put(filename, file, {
            access: "public",
            contentType: file.type,
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
          const buffer = Buffer.from(await file.arrayBuffer())
          const diskPath = path.join(uploadsDir, basename)
          await writeFile(diskPath, buffer)
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
