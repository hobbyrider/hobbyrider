"use client"

import { createSoftware } from "../actions/software"
import { getAllCategories } from "../actions/categories"
import { addProductImages } from "../actions/images"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

type Category = {
  id: string
  name: string
  slug: string
}

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error)
  }, [])

  if (status === "loading") {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <header className="mb-10">
            <h1 className="mb-2 text-4xl font-semibold tracking-tight text-gray-900">
              Submit Software
            </h1>
            <p className="text-lg text-gray-600">
              Share a tool you think is worth riding 🤖
            </p>
          </header>
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="mb-6 text-base text-gray-600">
              You must be logged in to submit a product
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="rounded-lg border-2 border-gray-900 bg-gray-900 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-900 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
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
      alert(error instanceof Error ? error.message : "Failed to upload thumbnail. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingGallery(true)
    try {
      const formData = new FormData()
      files.forEach((file) => {
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
      alert(error instanceof Error ? error.message : "Failed to upload images. Please try again.")
    } finally {
      setUploadingGallery(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Create the product first
      const response = await fetch("/api/create-product", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create product")
      }

      const { productId } = await response.json()

      // Then add gallery images if any
      if (galleryUrls.length > 0) {
        await addProductImages(productId, galleryUrls)
      }

      router.push(`/product/${productId}`)
    } catch (error: any) {
      console.error("Submit error:", error)
      alert(error.message || "Failed to submit product. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">submit software</h1>
        <p className="mt-2 text-gray-600">
          Share a tool you think is worth riding 🤖
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="ClickUp"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tagline</label>
            <input
              name="tagline"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Manage tasks, docs, and projects in one place."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              name="description"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Write a detailed description of what it does, who it’s for, and why it’s different…"
              rows={5}
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be shown on the product page.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">URL</label>
            <input
              name="url"
              type="url"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="https://clickup.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Embed <span className="text-xs font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              name="embedHtml"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors resize-y"
              placeholder='<div style="position: relative; aspect-ratio: 1024/640;"><iframe src="https://..." title="..." frameborder="0" loading="lazy" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>'
              rows={5}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Paste an iframe embed snippet (Loom/YouTube/Guideless, etc.).
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Thumbnail <span className="text-xs font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-1.5 text-xs text-gray-500">Uploading...</p>
            )}
            {thumbnailUrl && (
              <div className="mt-3">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                />
                <input type="hidden" name="thumbnail" value={thumbnailUrl} />
              </div>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              Square image recommended (240x240px). Max 2MB.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Screenshots <span className="text-xs font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadingGallery && (
              <p className="mt-1.5 text-xs text-gray-500">Uploading...</p>
            )}
            {galleryUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-24 w-full rounded-lg border border-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGalleryUrls(galleryUrls.filter((_, i) => i !== index))
                      }}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      aria-label={`Remove screenshot ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              Upload multiple screenshots to showcase your product. Max 2MB per image.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Categories <span className="text-xs font-normal text-gray-500">(optional)</span>
            </label>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-gray-300 bg-white p-3">
              {categories.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Loading categories... If empty, visit /api/seed-categories to create them.
                </p>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      name="categories"
                      value={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter((id) => id !== category.id)
                          )
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Select one or more categories (optional)
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg border-2 border-gray-900 bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800 active:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}