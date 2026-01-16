"use client"

import { createSoftware } from "@/app/actions/software"
import { getAllCategories } from "@/app/actions/categories"
import { addProductImages } from "@/app/actions/images"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import toast from "react-hot-toast"
import { PageTitle, Muted, Text, SmallHeading, LabelText, Small as SmallText, Caption } from "@/app/components/typography"

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
    getAllCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Failed to load categories:", error)
        toast.error("Failed to load categories. Please refresh the page.")
      })
  }, [])

  if (status === "loading") {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <Muted>Loading...</Muted>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <header className="mb-10">
            <PageTitle className="mb-2 text-gray-900">
              Submit Software
            </PageTitle>
            <Muted className="text-lg">
              Share a tool you think is worth riding 🤖
            </Muted>
          </header>
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Text className="mb-6 text-gray-600">
              You must be logged in to submit a product
            </Text>
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
      toast.success("Logo uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload logo. Please try again.")
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
      toast.success(`Successfully uploaded ${newUrls.length} image${newUrls.length !== 1 ? "s" : ""}!`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload images. Please try again.")
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

      toast.success("Product submitted successfully!")
      router.push(`/product/${productId}`)
    } catch (error: any) {
      console.error("Submit error:", error)
      toast.error(error.message || "Failed to submit product. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <PageTitle className="text-2xl sm:text-3xl text-gray-900">Submit your product</PageTitle>
        <Muted className="mt-2 text-sm sm:text-base">
          Get ranked by the community and discovered by your future users.
        </Muted>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div>
            <LabelText>Name</LabelText>
            <input
              name="name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
              placeholder="Guideless"
              required
            />
          </div>

          <div>
            <LabelText>Tagline</LabelText>
            <input
              name="tagline"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
              placeholder="The easiest way to make software video guides."
              required
            />
          </div>

          <div>
            <LabelText>Description (optional)</LabelText>
            <textarea
              name="description"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base resize-y focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
              placeholder="Write a detailed description of what it does, who it’s for, and why it’s different…"
              rows={5}
            />
            <Caption className="mt-1">
              This will be shown on the product page.
            </Caption>
          </div>

          <div>
            <LabelText>URL</LabelText>
            <input
              name="url"
              type="url"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
              placeholder="https://guideless.ai/"
              required
            />
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Video <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <textarea
              name="embedHtml"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors resize-y"
              placeholder='<div style="position: relative; aspect-ratio: 1024/640;"><iframe src="https://..." title="..." frameborder="0" loading="lazy" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>'
              rows={5}
            />
            <Caption className="mt-1.5">
              Paste an iframe embed snippet (Loom/YouTube/Guideless, etc.).
            </Caption>
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Logo <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <Caption className="mt-1.5">Uploading...</Caption>
            )}
            {thumbnailUrl && (
              <div className="mt-3">
                <img
                  src={thumbnailUrl}
                  alt="Logo preview"
                  className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                />
                <input type="hidden" name="thumbnail" value={thumbnailUrl} />
              </div>
            )}
            <Caption className="mt-1.5">
              Square image recommended (240x240px). Max 2MB.
            </Caption>
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Screenshots <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadingGallery && (
              <Caption className="mt-1.5">Uploading...</Caption>
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
            <Caption className="mt-1.5">
              Upload multiple screenshots to showcase your product. Max 2MB per image.
            </Caption>
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Categories <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-gray-300 bg-white p-3">
              {categories.length === 0 ? (
                <Caption>
                  Loading categories... If empty, visit /api/seed-categories to create them.
                </Caption>
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
            <Caption className="mt-1.5">
              Select one or more categories (optional)
            </Caption>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg border-2 border-gray-900 bg-gray-900 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-gray-800 active:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}