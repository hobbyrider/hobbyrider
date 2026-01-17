"use client"

import { updateSoftware } from "@/app/actions/software"
import { addProductImages, deleteProductImage } from "@/app/actions/images"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MarkdownInfo } from "@/app/components/markdown-info"

type Category = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  name: string
  tagline: string
  description?: string | null
  url: string
  thumbnail: string | null
  embedHtml?: string | null
  categories: { id: string; name: string; slug: string }[]
}

type ExistingImage = {
  id: string
  url: string
}

type EditProductFormProps = {
  product: Product
  categories: Category[]
  existingImages: ExistingImage[]
}

export default function EditProductForm({
  product,
  categories,
  existingImages,
}: EditProductFormProps) {
  const router = useRouter()
  const [name, setName] = useState(product.name)
  const [tagline, setTagline] = useState(product.tagline)
  const [description, setDescription] = useState(product.description || "")
  const [url, setUrl] = useState(product.url)
  const [thumbnailUrl, setThumbnailUrl] = useState(product.thumbnail || "")
  const [embedHtml, setEmbedHtml] = useState(product.embedHtml || "")
  const [galleryUrls, setGalleryUrls] = useState<string[]>(existingImages.map((img) => img.url))
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]) // Track image IDs to delete
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product.categories.map((c) => c.id)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type for logo (only .svg and .png)
    const allowedTypes = ["image/svg+xml", "image/png"]
    const allowedExtensions = [".svg", ".png"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError("Logo must be a .svg or .png file. Please select a valid image format.")
      e.target.value = ""
      return
    }

    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || `Upload failed (${response.status})`)
      }

      const data = await response.json()
      setThumbnailUrl(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload thumbnail")
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types for screenshots (only .png, .jpg, .webp)
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"]
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"]
    
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (const file of files) {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    }
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.join(", ")}. Screenshots must be .png, .jpg, or .webp files.`)
      if (validFiles.length === 0) {
        e.target.value = ""
        return
      }
    }

    // Check limit of 6 screenshots
    const currentCount = galleryUrls.length
    const maxScreenshots = 6
    if (currentCount >= maxScreenshots) {
      setError(`Maximum ${maxScreenshots} screenshots allowed. Please remove some before adding more.`)
      e.target.value = ""
      return
    }

    // Limit files to what can still be added
    const remainingSlots = maxScreenshots - currentCount
    const filesToUpload = validFiles.slice(0, remainingSlots)
    if (validFiles.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more screenshot${remainingSlots !== 1 ? "s" : ""}. Uploading ${remainingSlots} of ${validFiles.length}.`)
    }

    setUploadingGallery(true)
    setError(null)
    try {
      const formData = new FormData()
      filesToUpload.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || `Upload failed (${response.status})`)
      }

      const data = await response.json()
      const newUrls = data.urls || [data.url]
      setGalleryUrls([...galleryUrls, ...newUrls])
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload images")
    } finally {
      setUploadingGallery(false)
      e.target.value = ""
    }
  }

  const handleRemoveGalleryImage = async (url: string, index: number) => {
    // Find if this is an existing image from the database
    const existingImage = existingImages.find((img) => img.url === url)
    
    if (existingImage) {
      // Mark for deletion when form is submitted
      setImagesToDelete([...imagesToDelete, existingImage.id])
    }
    
    // Remove from UI immediately
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("tagline", tagline)
      if (description.trim()) {
        formData.append("description", description)
      }
      formData.append("url", url)
      if (thumbnailUrl) {
        formData.append("thumbnail", thumbnailUrl)
      }
      if (embedHtml.trim()) {
        formData.append("embedHtml", embedHtml)
      }
      selectedCategories.forEach((id) => {
        formData.append("categories", id)
      })

      await updateSoftware(product.id, formData)

      // Delete images that were removed
      for (const imageId of imagesToDelete) {
        try {
          await deleteProductImage(imageId, product.id)
        } catch (error) {
          console.error(`Failed to delete image ${imageId}:`, error)
        }
      }

      // Add new gallery images (ones not in existing images)
      const existingImageUrls = existingImages.map((img) => img.url)
      const newGalleryUrls = galleryUrls.filter(
        (url) => !existingImageUrls.includes(url)
      )
      if (newGalleryUrls.length > 0) {
        await addProductImages(product.id, newGalleryUrls)
      }

      router.push(`/product/${product.id}`)
      router.refresh()
    } catch (error: any) {
      console.error("Update error:", error)
      setError(error.message || "Failed to update product. Please try again.")
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-xl">
        <Link
          href={`/product/${product.id}`}
          className="text-sm text-gray-600 hover:text-black mb-6 inline-block"
        >
          ← Back to product
        </Link>

        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-gray-600">Update your product information</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="ClickUp"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Short, clear one-liner."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <MarkdownInfo />
              </div>
              <span className={`text-xs ${description.replace(/<[^>]*>/g, "").length > 800 ? "text-red-600" : "text-gray-500"}`}>
                {description.replace(/<[^>]*>/g, "").length}/800
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Write a detailed description of what it does, who it’s for, and why it’s different…"
              rows={5}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">URL</label>
              <span className={`text-xs ${url.length > 40 ? "text-red-600" : "text-gray-500"}`}>
                {url.length}/40
              </span>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://clickup.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Embed (optional)</label>
              <span className={`text-xs ${embedHtml.length > 800 ? "text-red-600" : "text-gray-500"}`}>
                {embedHtml.length}/800
              </span>
            </div>
            <textarea
              value={embedHtml}
              onChange={(e) => setEmbedHtml(e.target.value)}
              maxLength={800}
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
              placeholder='e.g. <div style="position: relative; aspect-ratio: 1024/640;"><iframe src="..." title="..." frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; color-scheme: light;"></iframe></div>'
              rows={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Thumbnail (optional)</label>
            <input
              type="file"
              accept=".svg,.png,image/svg+xml,image/png"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-1 text-xs text-gray-500">Uploading...</p>
            )}
            {thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="h-24 w-24 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove thumbnail
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              SVG or PNG only. Square format (240×240px). Max 2MB.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Images (optional)</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery || galleryUrls.length >= 6}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadingGallery && (
              <p className="mt-1 text-xs text-gray-500">Uploading...</p>
            )}
            {galleryUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(url, index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, or WebP. Up to 6 images. Max 2MB per image.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Categories</label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    disabled={!selectedCategories.includes(category.id) && selectedCategories.length >= 5}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (selectedCategories.length >= 5) {
                          setError("Maximum 5 categories allowed. Please deselect a category first.")
                          return
                        }
                        setSelectedCategories([...selectedCategories, category.id])
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((id) => id !== category.id)
                        )
                      }
                    }}
                    className="rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select up to 5 categories (optional)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg border px-4 py-2 font-semibold hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/product/${product.id}`}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
        </div>
      </div>
    </main>
  )
}
