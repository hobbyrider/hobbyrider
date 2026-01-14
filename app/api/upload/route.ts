import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const singleFile = formData.get("file") as File | null

    // Support both single file and multiple files
    const filesToProcess = files.length > 0 ? files : singleFile ? [singleFile] : []

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of filesToProcess) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue // Skip invalid files
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        continue // Skip oversized files
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split(".").pop() || "jpg"
      const filename = `${timestamp}-${randomStr}.${extension}`

      // Save to public/uploads directory
      const publicDir = join(process.cwd(), "public", "uploads")
      const filepath = join(publicDir, filename)

      // Ensure directory exists
      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true })
      }

      await writeFile(filepath, buffer)

      // Return the public URL
      const publicUrl = `/uploads/${filename}`
      uploadedUrls.push(publicUrl)
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images uploaded" },
        { status: 400 }
      )
    }

    // Return single URL for backward compatibility, or array for multiple files
    if (filesToProcess.length === 1) {
      return NextResponse.json({ url: uploadedUrls[0] })
    } else {
      return NextResponse.json({ urls: uploadedUrls })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
