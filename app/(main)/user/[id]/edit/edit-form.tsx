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

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
          placeholder="Your name"
          disabled={isPending}
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
          placeholder="username"
          pattern="[a-z0-9_-]+"
          disabled={isPending}
        />
        <p className="mt-2 text-xs text-gray-500">
          Only lowercase letters, numbers, hyphens, and underscores
        </p>
      </div>

      {/* Headline */}
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
          Headline
        </label>
        <input
          type="text"
          id="headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
          placeholder="e.g., building https://guideless.ai"
          maxLength={100}
          disabled={isPending}
        />
        <p className="mt-2 text-xs text-gray-500">
          A short tagline that appears below your name
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          About
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={6}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors resize-none"
          placeholder="Tell us about yourself..."
          disabled={isPending}
        />
      </div>

      {/* Links Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Links</h2>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
            placeholder="https://example.com"
            disabled={isPending}
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
            placeholder="https://linkedin.com/in/username"
            disabled={isPending}
          />
        </div>

        {/* Twitter/X */}
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
            X (Twitter)
          </label>
          <input
            type="url"
            id="twitter"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
            placeholder="https://x.com/username"
            disabled={isPending}
          />
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
