"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"

// Field limits
const MAX_NAME = 50
const MAX_USERNAME = 30
const MAX_HEADLINE = 100
const MAX_BIO = 1000
const MAX_URL = 200

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
// in editor tooling. Runtime schema is authoritative.
const prismaAny = prisma as any

type UpdateProfileData = {
  name?: string | null
  username?: string | null
  headline?: string | null
  bio?: string | null
  website?: string | null
  linkedin?: string | null
  twitter?: string | null
  image?: string | null
}

export async function updateUserProfile(data: UpdateProfileData) {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile")
  }

  // Validate username if provided
  if (data.username !== undefined && data.username !== null) {
    const trimmedUsername = data.username.trim()
    
    if (trimmedUsername) {
      // Check if username is already taken by another user
      const existingUser = await prismaAny.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: session.user.id },
        },
      })

      if (existingUser) {
        throw new Error("Username is already taken")
      }

      // Validate username format
      if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
        throw new Error("Username can only contain lowercase letters, numbers, hyphens, and underscores")
      }
    }
  }

  // Validate URLs if provided
  const urlFields = ["website", "linkedin", "twitter"] as const
  for (const field of urlFields) {
    const value = data[field]
    if (value && value.trim()) {
      try {
        const url = new URL(value)
        // Ensure URL has http or https protocol
        if (!url.protocol.startsWith("http")) {
          throw new Error(`URL must start with http:// or https://`)
        }
      } catch {
        throw new Error(`Invalid URL for ${field}`)
      }
    }
  }

  // Prepare update data with validation and sanitization
  const updateData: any = {}
  
  if (data.name !== undefined) {
    const nameValue = data.name?.trim() || null
    if (nameValue && nameValue.length > MAX_NAME) {
      throw new Error(`Name must be ${MAX_NAME} characters or less`)
    }
    // Strip HTML tags from name
    const nameClean = nameValue ? nameValue.replace(/<[^>]*>/g, "") : null
    updateData.name = sanitizeInput(nameClean || "", MAX_NAME) || null
  }
  
  if (data.username !== undefined) {
    const usernameValue = data.username?.trim() || null
    if (usernameValue && usernameValue.length > MAX_USERNAME) {
      throw new Error(`Username must be ${MAX_USERNAME} characters or less`)
    }
    updateData.username = usernameValue || null
  }
  
  if (data.headline !== undefined) {
    const headlineValue = data.headline?.trim() || null
    if (headlineValue && headlineValue.length > MAX_HEADLINE) {
      throw new Error(`Headline must be ${MAX_HEADLINE} characters or less`)
    }
    // Strip HTML tags from headline
    const headlineClean = headlineValue ? headlineValue.replace(/<[^>]*>/g, "") : null
    updateData.headline = sanitizeInput(headlineClean || "", MAX_HEADLINE) || null
  }
  
  if (data.bio !== undefined) {
    const bioValue = data.bio?.trim() || null
    if (bioValue) {
      // Strip HTML tags for character count
      const bioClean = bioValue.replace(/<[^>]*>/g, "")
      if (bioClean.length > MAX_BIO) {
        throw new Error(`Bio must be ${MAX_BIO} characters or less`)
      }
      // Strip HTML tags from bio (plain text only)
      updateData.bio = sanitizeInput(bioClean, MAX_BIO) || null
    } else {
      updateData.bio = null
    }
  }
  
  if (data.website !== undefined) {
    const websiteValue = data.website?.trim() || null
    if (websiteValue && websiteValue.length > MAX_URL) {
      throw new Error(`Website URL must be ${MAX_URL} characters or less`)
    }
    updateData.website = websiteValue || null
  }
  
  if (data.linkedin !== undefined) {
    const linkedinValue = data.linkedin?.trim() || null
    if (linkedinValue && linkedinValue.length > MAX_URL) {
      throw new Error(`LinkedIn URL must be ${MAX_URL} characters or less`)
    }
    updateData.linkedin = linkedinValue || null
  }
  
  if (data.twitter !== undefined) {
    const twitterValue = data.twitter?.trim() || null
    if (twitterValue && twitterValue.length > MAX_URL) {
      throw new Error(`X (Twitter) URL must be ${MAX_URL} characters or less`)
    }
    updateData.twitter = twitterValue || null
  }
  if (data.image !== undefined) {
    updateData.image = data.image || null
  }

  // Only update if there's data to update
  if (Object.keys(updateData).length === 0) {
    // No changes, just return current user
    const currentUser = await prismaAny.user.findUnique({
      where: { id: session.user.id },
    })
    return currentUser
  }

  try {
    // Update user profile
    const updatedUser = await prismaAny.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // Revalidate user profile pages
    revalidatePath(`/user/${updatedUser.username || updatedUser.id}`)
    revalidatePath(`/user/${updatedUser.id}/edit`)

    return updatedUser
  } catch (error: any) {
    console.error("Error updating user profile:", {
      error,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      updateData,
      userId: session.user.id,
    })
    
    // Provide more helpful error messages
    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0] || "field"
      throw new Error(`${field === "username" ? "Username" : "Field"} is already taken`)
    }
    
    // Check for unknown field errors
    if (error?.message?.includes("Unknown argument")) {
      throw new Error("Database schema is out of sync. Please restart the server.")
    }
    
    throw new Error(error?.message || "Failed to update profile. Please try again.")
  }
}
