"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateUserProfile } from "@/app/actions/user"
import Link from "next/link"

type User = {
  id: string
  name: string | null
  username: string | null
  email: string
  image: string | null
  headline: string | null
  bio: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
}

type EditProfileFormProps = {
  user: User
}

// Field limits
const MAX_NAME = 50
const MAX_USERNAME = 30
const MAX_HEADLINE = 100
const MAX_BIO = 1000
const MAX_URL = 200

// Validation functions
function validateName(value: string): string | null {
  if (!value.trim()) return null // Optional field
  if (value.length > MAX_NAME) return `Name must be ${MAX_NAME} characters or less`
  
  // Check for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  if (emojiRegex.test(value)) return "Name cannot contain emojis"
  
  return null
}

function validateUsername(value: string): string | null {
  if (!value.trim()) return null // Optional field
  if (value.length > MAX_USERNAME) return `Username must be ${MAX_USERNAME} characters or less`
  if (!/^[a-z0-9_-]+$/.test(value)) return "Username can only contain lowercase letters, numbers, hyphens, and underscores"
  return null
}

function validateHeadline(value: string): string | null {
  if (!value.trim()) return null // Optional field
  if (value.length > MAX_HEADLINE) return `Headline must be ${MAX_HEADLINE} characters or less`
  
  // Check for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  if (emojiRegex.test(value)) return "Headline cannot contain emojis"
  
  return null
}

function validateBio(value: string): string | null {
  if (!value.trim()) return null // Optional field
  
  // Strip HTML tags for character count
  const plainText = value.replace(/<[^>]*>/g, "")
  if (plainText.length > MAX_BIO) return `Bio must be ${MAX_BIO} characters or less`
  
  return null
}

function validateUrl(value: string): string | null {
  if (!value.trim()) return null // Optional field
  if (value.length > MAX_URL) return `URL must be ${MAX_URL} characters or less`
  
  try {
    const url = new URL(value)
    if (!url.protocol.startsWith("http")) {
      return "URL must start with http:// or https://"
    }
  } catch {
    return "Invalid URL format"
  }
  
  return null
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    headline: user.headline || "",
    bio: user.bio || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    twitter: user.twitter || "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user.image || null
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setProfileImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle field change with validation
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    let error: string | null = null
    switch (field) {
      case "name":
        error = validateName(value)
        break
      case "username":
        error = validateUsername(value)
        break
      case "headline":
        error = validateHeadline(value)
        break
      case "bio":
        error = validateBio(value)
        break
      case "website":
      case "linkedin":
      case "twitter":
        error = validateUrl(value)
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

  // Get character count for bio (plain text, no HTML)
  const getBioCharCount = (value: string): number => {
    return value.replace(/<[^>]*>/g, "").length
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError
    
    const usernameError = validateUsername(formData.username)
    if (usernameError) newErrors.username = usernameError
    
    const headlineError = validateHeadline(formData.headline)
    if (headlineError) newErrors.headline = headlineError
    
    const bioError = validateBio(formData.bio)
    if (bioError) newErrors.bio = bioError
    
    const websiteError = validateUrl(formData.website)
    if (websiteError) newErrors.website = websiteError
    
    const linkedinError = validateUrl(formData.linkedin)
    if (linkedinError) newErrors.linkedin = linkedinError
    
    const twitterError = validateUrl(formData.twitter)
    if (twitterError) newErrors.twitter = twitterError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate before submission
    if (!validateForm()) {
      setError("Please fix the errors in the form before submitting.")
      return
    }

    startTransition(async () => {
      try {
        let imageUrl = user.image

        // Upload profile image if changed
        if (profileImage) {
          const formData = new FormData()
          formData.append("file", profileImage)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const err = await response.json().catch(() => null)
            throw new Error(err?.error || `Upload failed (${response.status})`)
          }

          const data = await response.json()
          imageUrl = data.url
        }

        // Update profile - only send fields that have values or are explicitly being cleared
        await updateUserProfile({
          name: formData.name.trim() || null,
          username: formData.username.trim() || null,
          headline: formData.headline.trim() || null,
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          linkedin: formData.linkedin.trim() || null,
          twitter: formData.twitter.trim() || null,
          image: imageUrl || null,
        })

        setSuccess(true)
        setTimeout(() => {
          router.push(`/user/${formData.username || user.id}`)
          router.refresh()
        }, 1000)
      } catch (err: any) {
        setError(err.message || "Failed to update profile")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture */}
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {profileImagePreview ? (
            <img
              src={profileImagePreview}
              alt="Profile preview"
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gray-200 text-2xl sm:text-4xl font-bold text-gray-700 border-2 border-gray-300">
              {(formData.name || formData.username || user.email || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-gray-300 file:bg-white file:text-gray-700 hover:file:bg-gray-50 file:cursor-pointer"
            disabled={isPending}
          />
          <p className="mt-2 text-xs text-gray-500">
            Recommended size: 400x400px. Max file size: 5MB
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <span className={`text-xs ${formData.name.length > MAX_NAME ? "text-red-600" : "text-gray-500"}`}>
            {formData.name.length}/{MAX_NAME}
          </span>
        </div>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          maxLength={MAX_NAME}
          className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
            errors.name
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-gray-900"
          }`}
          placeholder="Your name"
          disabled={isPending}
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <span className={`text-xs ${formData.username.length > MAX_USERNAME ? "text-red-600" : "text-gray-500"}`}>
            {formData.username.length}/{MAX_USERNAME}
          </span>
        </div>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => handleFieldChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
          maxLength={MAX_USERNAME}
          className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
            errors.username
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-gray-900"
          }`}
          placeholder="username"
          pattern="[a-z0-9_-]+"
          disabled={isPending}
        />
        {errors.username && (
          <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Only lowercase letters, numbers, hyphens, and underscores
        </p>
      </div>

      {/* Headline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
            Headline
          </label>
          <span className={`text-xs ${formData.headline.length > MAX_HEADLINE ? "text-red-600" : "text-gray-500"}`}>
            {formData.headline.length}/{MAX_HEADLINE}
          </span>
        </div>
        <input
          type="text"
          id="headline"
          value={formData.headline}
          onChange={(e) => handleFieldChange("headline", e.target.value)}
          maxLength={MAX_HEADLINE}
          className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
            errors.headline
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-gray-900"
          }`}
          placeholder="e.g., building https://guideless.ai"
          disabled={isPending}
        />
        {errors.headline && (
          <p className="mt-1.5 text-sm text-red-600">{errors.headline}</p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          A short tagline that appears below your name
        </p>
      </div>

      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            About
          </label>
          <span className={`text-xs ${getBioCharCount(formData.bio) > MAX_BIO ? "text-red-600" : "text-gray-500"}`}>
            {getBioCharCount(formData.bio)}/{MAX_BIO}
          </span>
        </div>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleFieldChange("bio", e.target.value)}
          rows={6}
          className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${
            errors.bio
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-gray-900"
          }`}
          placeholder="Tell us about yourself..."
          disabled={isPending}
        />
        {errors.bio && (
          <p className="mt-1.5 text-sm text-red-600">{errors.bio}</p>
        )}
      </div>

      {/* Links Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Links</h2>

        {/* Website */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <span className={`text-xs ${formData.website.length > MAX_URL ? "text-red-600" : "text-gray-500"}`}>
              {formData.website.length}/{MAX_URL}
            </span>
          </div>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => handleFieldChange("website", e.target.value)}
            maxLength={MAX_URL}
            className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
              errors.website
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
            placeholder="https://example.com"
            disabled={isPending}
          />
          {errors.website && (
            <p className="mt-1.5 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <span className={`text-xs ${formData.linkedin.length > MAX_URL ? "text-red-600" : "text-gray-500"}`}>
              {formData.linkedin.length}/{MAX_URL}
            </span>
          </div>
          <input
            type="url"
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => handleFieldChange("linkedin", e.target.value)}
            maxLength={MAX_URL}
            className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
              errors.linkedin
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
            placeholder="https://linkedin.com/in/username"
            disabled={isPending}
          />
          {errors.linkedin && (
            <p className="mt-1.5 text-sm text-red-600">{errors.linkedin}</p>
          )}
        </div>

        {/* Twitter/X */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
              X
            </label>
            <span className={`text-xs ${formData.twitter.length > MAX_URL ? "text-red-600" : "text-gray-500"}`}>
              {formData.twitter.length}/{MAX_URL}
            </span>
          </div>
          <input
            type="url"
            id="twitter"
            value={formData.twitter}
            onChange={(e) => handleFieldChange("twitter", e.target.value)}
            maxLength={MAX_URL}
            className={`w-full rounded-lg border-2 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${
              errors.twitter
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-gray-900"
            }`}
            placeholder="https://x.com/username"
            disabled={isPending}
          />
          {errors.twitter && (
            <p className="mt-1.5 text-sm text-red-600">{errors.twitter}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">Profile updated successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <Link
          href={`/user/${user.username || user.id}`}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gray-900 text-white px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}
