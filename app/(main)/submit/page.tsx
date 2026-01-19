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
import { MarkdownInfo } from "@/app/components/markdown-info"

type Category = {
  id: string
  name: string
  slug: string
}

type ValidationError = {
  field: string
  message: string
}

// Field limits
const MAX_NAME = 40
const MAX_TAGLINE = 70
const MAX_DESCRIPTION = 800
const MAX_URL = 40
const MAX_EMBED = 800

// Validation functions
function validateName(value: string): string | null {
  if (!value.trim()) return "Name is required"
  if (value.length > MAX_NAME) return `Name must be ${MAX_NAME} characters or less`
  
  // Check for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  if (emojiRegex.test(value)) return "Name cannot contain emojis"
  
  // Check for URLs (basic pattern)
  const urlRegex = /(https?:\/\/|www\.)/i
  if (urlRegex.test(value)) return "Name cannot contain URLs"
  
  // Check for ALL CAPS (more than 3 consecutive uppercase letters suggests shouting)
  if (value === value.toUpperCase() && value.length > 3) return "Name cannot be all uppercase"
  
  // Check for separators (taglines)
  const separatorRegex = /[–|:]/
  if (separatorRegex.test(value)) return "Name cannot contain separators (–, |, :)"
  
  return null
}

function validateTagline(value: string): string | null {
  if (!value.trim()) return "Tagline is required"
  if (value.length > MAX_TAGLINE) return `Tagline must be ${MAX_TAGLINE} characters or less`
  
  // Check for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  if (emojiRegex.test(value)) return "Tagline cannot contain emojis"
  
  // Check for multiple exclamation marks
  const exclamationCount = (value.match(/!/g) || []).length
  if (exclamationCount > 1) return "Tagline can have at most 1 exclamation mark"
  
  // Check for pricing/promos/CTAs
  const promoPatterns = /\b(free|50%|off|try now|sign up|get started|download|buy|purchase|discount|promo|sale)\b/i
  if (promoPatterns.test(value)) return "Tagline cannot contain pricing, promotions, or CTAs"
  
  // Check if it ends with a period
  if (!value.trim().endsWith('.')) {
    return "Tagline must end with a period (.)"
  }
  
  return null
}

function validateDescription(value: string): string | null {
  if (!value.trim()) return null // Optional field
  
  // Strip HTML tags for character count (markdown is allowed, but HTML tags are stripped)
  const plainText = value.replace(/<[^>]*>/g, "")
  if (plainText.length > MAX_DESCRIPTION) return `Description must be ${MAX_DESCRIPTION} characters or less`
  
  // Block raw HTML tags for security
  const htmlTagRegex = /<[^>]+>/g
  const hasHtmlTags = htmlTagRegex.test(value)
  if (hasHtmlTags) return "HTML tags are not allowed. Use Markdown formatting instead (e.g., **bold**, *italic*, # heading)"
  
  // Allow markdown links [text](url), but block raw URLs (security/spam prevention)
  // Remove all markdown links first, then check if any raw URLs remain
  const withoutMarkdownLinks = value.replace(/\[([^\]]*)\]\([^\)]+\)/g, "")
  const rawUrlRegex = /(https?:\/\/|www\.)/i
  if (rawUrlRegex.test(withoutMarkdownLinks)) {
    return "Raw URLs are not allowed. Use Markdown links instead: [text](https://example.com)"
  }
  
  return null
}

function validateUrl(value: string): string | null {
  if (!value.trim()) return "URL is required"
  if (value.length > MAX_URL) return `URL must be ${MAX_URL} characters or less`
  
  // Must start with https://
  if (!value.startsWith("https://")) {
    return "URL must start with https://"
  }
  
  // Reject URL shorteners (common patterns)
  const shortenerDomains = [
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", 
    "is.gd", "buff.ly", "short.link", "rebrand.ly", "cutt.ly"
  ]
  const hostname = new URL(value).hostname.toLowerCase()
  if (shortenerDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
    return "URL shorteners are not allowed. Please use the full URL."
  }
  
  return null
}

function validateEmbed(value: string): string | null {
  if (!value.trim()) return null // Optional field
  if (value.length > MAX_EMBED) return `Embed code must be ${MAX_EMBED} characters or less`
  
  // Must contain iframe
  if (!/<iframe[\s>]/i.test(value)) {
    return "Embed code must be an iframe"
  }
  
  // Check for script tags (should be stripped server-side, but warn client-side)
  if (/<script[\s>]/i.test(value)) {
    return "Embed code cannot contain script tags"
  }
  
  // Check for autoplay with sound
  if (/autoplay[\s=]/i.test(value) && /muted[\s=]/i.test(value) === false) {
    return "Autoplay videos must be muted"
  }
  
  return null
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
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: "",
    tagline: "",
    description: "",
    url: "",
    embedHtml: "",
  })
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Muted>Loading...</Muted>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-2xl">
          <header className="mb-10">
            <PageTitle className="mb-2 text-gray-900">
              Submit Software
            </PageTitle>
            <Muted className="text-lg">
              Curated, community-ranked products directory. Built for builders, by builders.
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
        </div>
      </main>
    )
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type for logo (only .svg and .png)
    const allowedTypes = ["image/svg+xml", "image/png"]
    const allowedExtensions = [".svg", ".png"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error("Logo must be a .svg or .png file. Please select a valid image format.")
      e.target.value = ""
      return
    }

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
      toast.error(`Invalid file type(s): ${invalidFiles.join(", ")}. Screenshots must be .png, .jpg, or .webp files.`)
      if (validFiles.length === 0) {
        e.target.value = ""
        return
      }
    }

    // Check limit of 6 screenshots
    const currentCount = galleryUrls.length
    const maxScreenshots = 6
    if (currentCount >= maxScreenshots) {
      toast.error(`Maximum ${maxScreenshots} screenshots allowed. Please remove some before adding more.`)
      e.target.value = ""
      return
    }

    // Limit files to what can still be added
    const remainingSlots = maxScreenshots - currentCount
    const filesToUpload = validFiles.slice(0, remainingSlots)
    if (validFiles.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more screenshot${remainingSlots !== 1 ? "s" : ""}. Uploading ${remainingSlots} of ${validFiles.length}.`)
    }

    setUploadingGallery(true)
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

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    const nameError = validateName(formValues.name)
    if (nameError) newErrors.name = nameError
    
    const taglineError = validateTagline(formValues.tagline)
    if (taglineError) newErrors.tagline = taglineError
    
    const descriptionError = validateDescription(formValues.description)
    if (descriptionError) newErrors.description = descriptionError
    
    const urlError = validateUrl(formValues.url)
    if (urlError) newErrors.url = urlError
    
    const embedError = validateEmbed(formValues.embedHtml)
    if (embedError) newErrors.embedHtml = embedError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    let error: string | null = null
    switch (field) {
      case "name":
        error = validateName(value)
        break
      case "tagline":
        error = validateTagline(value)
        break
      case "description":
        error = validateDescription(value)
        break
      case "url":
        error = validateUrl(value)
        break
      case "embedHtml":
        error = validateEmbed(value)
        break
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error! }))
    } else {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Get character count for description (plain text, no HTML)
  const getDescriptionCharCount = (value: string): number => {
    return value.replace(/<[^>]*>/g, "").length
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.")
      return
    }
    
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
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-xl">
        <header className="mb-6 sm:mb-8">
          <PageTitle className="text-2xl sm:text-3xl text-gray-900">Submit your product</PageTitle>
          <Muted className="mt-2 text-sm sm:text-base">
            Get ranked by the community and discovered by your future users.
          </Muted>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <LabelText>Name</LabelText>
              <Caption className={formValues.name.length > MAX_NAME ? "text-red-600" : "text-gray-500"}>
                {formValues.name.length}/{MAX_NAME}
              </Caption>
            </div>
            <input
              name="name"
              value={formValues.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              maxLength={MAX_NAME}
              className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              }`}
              placeholder="e.g. Guideless"
              required
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <LabelText>Tagline</LabelText>
              <Caption className={formValues.tagline.length > MAX_TAGLINE ? "text-red-600" : "text-gray-500"}>
                {formValues.tagline.length}/{MAX_TAGLINE}
              </Caption>
            </div>
            <input
              name="tagline"
              value={formValues.tagline}
              onChange={(e) => handleFieldChange("tagline", e.target.value)}
              maxLength={MAX_TAGLINE}
              className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.tagline
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              }`}
              placeholder="Short, clear one-liner."
              required
            />
            {errors.tagline && (
              <p className="mt-1.5 text-sm text-red-600">{errors.tagline}</p>
            )}
            <Caption className="mt-1.5">
              One clear sentence describing the product's value.
            </Caption>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LabelText>Description (optional)</LabelText>
                <MarkdownInfo />
              </div>
              <Caption className={getDescriptionCharCount(formValues.description) > MAX_DESCRIPTION ? "text-red-600" : "text-gray-500"}>
                {getDescriptionCharCount(formValues.description)}/{MAX_DESCRIPTION}
              </Caption>
            </div>
            <textarea
              name="description"
              value={formValues.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-base resize-y focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              }`}
              placeholder="Write a detailed description of what it does, who it’s for, and why it’s different…"
              rows={5}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>
            )}
            <Caption className="mt-1.5">
              Describe what your product does, who it's for, and the main benefit.
            </Caption>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <LabelText>URL</LabelText>
              <Caption className={formValues.url.length > MAX_URL ? "text-red-600" : "text-gray-500"}>
                {formValues.url.length}/{MAX_URL}
              </Caption>
            </div>
            <input
              name="url"
              type="url"
              value={formValues.url}
              onChange={(e) => handleFieldChange("url", e.target.value)}
              maxLength={MAX_URL}
              className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.url
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              }`}
              placeholder="e.g. https://guideless.ai"
              required
            />
            {errors.url && (
              <p className="mt-1.5 text-sm text-red-600">{errors.url}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <LabelText className="text-gray-900">
                Video <span className="text-xs font-normal text-gray-500">(optional)</span>
              </LabelText>
              <Caption className={formValues.embedHtml.length > MAX_EMBED ? "text-red-600" : "text-gray-500"}>
                {formValues.embedHtml.length}/{MAX_EMBED}
              </Caption>
            </div>
            <textarea
              name="embedHtml"
              value={formValues.embedHtml}
              onChange={(e) => handleFieldChange("embedHtml", e.target.value)}
              maxLength={MAX_EMBED}
              className={`w-full rounded-lg border bg-white px-4 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors resize-y ${
                errors.embedHtml
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              }`}
              placeholder='e.g. <div style="position: relative; aspect-ratio: 1024/640;"><iframe src="..." title="..." frameborder="0" loading="lazy" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; color-scheme: light;"></iframe></div>'
              rows={5}
            />
            {errors.embedHtml && (
              <p className="mt-1.5 text-sm text-red-600">{errors.embedHtml}</p>
            )}
            <Caption className="mt-1.5">
              Paste an iframe embed snippet (YouTube, Guideless, etc.).
            </Caption>
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Logo <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <input
              type="file"
              accept=".svg,.png,image/svg+xml,image/png"
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
              SVG or PNG only. Square format (240×240px). Max 2MB.
            </Caption>
          </div>

          <div>
            <LabelText className="mb-2 block text-gray-900">
              Images <span className="text-xs font-normal text-gray-500">(optional)</span>
            </LabelText>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery || galleryUrls.length >= 6}
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
              PNG, JPG, or WebP. Up to 6 images. Max 2MB per image.
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
                      disabled={!selectedCategories.includes(category.id) && selectedCategories.length >= 5}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedCategories.length >= 5) {
                            toast.error("Maximum 5 categories allowed. Please deselect a category first.")
                            return
                          }
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter((id) => id !== category.id)
                          )
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))
              )}
            </div>
            <Caption className="mt-1.5">
              Select up to 5 categories (optional)
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
      </div>
    </main>
  )
}