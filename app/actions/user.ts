"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"

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

  // Prepare update data, converting empty strings to null
  const updateData: any = {}
  
  if (data.name !== undefined) {
    updateData.name = data.name?.trim() || null
  }
  if (data.username !== undefined) {
    updateData.username = data.username?.trim() || null
  }
  if (data.headline !== undefined) {
    updateData.headline = data.headline?.trim() || null
  }
  if (data.bio !== undefined) {
    updateData.bio = data.bio?.trim() || null
  }
  if (data.website !== undefined) {
    updateData.website = data.website?.trim() || null
  }
  if (data.linkedin !== undefined) {
    updateData.linkedin = data.linkedin?.trim() || null
  }
  if (data.twitter !== undefined) {
    updateData.twitter = data.twitter?.trim() || null
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
