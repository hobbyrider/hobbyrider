"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/get-session"
import { redirect } from "next/navigation"

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
// in editor tooling. Runtime schema is authoritative.
const prismaAny = prisma as any

const MAX_NAME = 50
const MAX_USERNAME = 30
const MAX_HEADLINE = 100
const MAX_BIO = 1000
const MAX_URL = 200

type UpdateProfileData = {
  name?: string | null
  username?: string | null
  headline?: string | null
  bio?: string | null
  website?: string | null
  linkedin?: string | null
  twitter?: string | null
  image?: string | null
  notifyOnUpvotes?: boolean
  notifyOnComments?: boolean
}

export async function updateUserProfile(data: UpdateProfileData) {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile")
  }

  const updateData: any = {}

  // Validate username if provided
  if (data.username !== undefined && data.username !== null) {
    const trimmedUsername = data.username.trim()
    
    if (!trimmedUsername) {
      throw new Error("Username is required")
    }

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
    // else: if username is undefined or null, let it be handled by other parts of the logic
  } else {
    throw new Error("Username is required")
  }

  // Validate URLs if provided
  if (data.website !== undefined) {
    const websiteValue = data.website?.trim() || null
    if (websiteValue && !websiteValue.match(/^https?:\/\//)) {
      throw new Error("Website URL must start with http:// or https://")
    }
    if (websiteValue && websiteValue.length > MAX_URL) {
      throw new Error(`Website URL must be ${MAX_URL} characters or less`)
    }
    updateData.website = websiteValue
  }

  if (data.linkedin !== undefined) {
    const linkedinValue = data.linkedin?.trim() || null
    if (linkedinValue && !linkedinValue.match(/^https?:\/\//)) {
      throw new Error("LinkedIn URL must start with http:// or https://")
    }
    if (linkedinValue && linkedinValue.length > MAX_URL) {
      throw new Error(`LinkedIn URL must be ${MAX_URL} characters or less`)
    }
    updateData.linkedin = linkedinValue
  }
  
  if (data.twitter !== undefined) {
    const twitterValue = data.twitter?.trim() || null
    if (twitterValue && !twitterValue.match(/^https?:\/\//)) {
      throw new Error("X (Twitter) URL must start with http:// or https://")
    }
    if (twitterValue && twitterValue.length > MAX_URL) {
      throw new Error(`X (Twitter) URL must be ${MAX_URL} characters or less`)
    }
    updateData.twitter = twitterValue
  }
  if (data.image !== undefined) {
    updateData.image = data.image || null
  }

  if (data.notifyOnUpvotes !== undefined) {
    updateData.notifyOnUpvotes = data.notifyOnUpvotes
  }

  if (data.notifyOnComments !== undefined) {
    updateData.notifyOnComments = data.notifyOnComments
  }

  // Validate other fields if provided
  if (data.name !== undefined) {
    const nameValue = data.name?.trim() || null
    if (nameValue && nameValue.length > MAX_NAME) {
      throw new Error(`Name must be ${MAX_NAME} characters or less`)
    }
    updateData.name = nameValue
  }

  if (data.headline !== undefined) {
    const headlineValue = data.headline?.trim() || null
    if (headlineValue && headlineValue.length > MAX_HEADLINE) {
      throw new Error(`Headline must be ${MAX_HEADLINE} characters or less`)
    }
    updateData.headline = headlineValue
  }
  
  if (data.bio !== undefined) {
    const bioValue = data.bio?.trim() || null
    if (bioValue && bioValue.length > MAX_BIO) {
      throw new Error(`Bio must be ${MAX_BIO} characters or less`)
    }
    updateData.bio = bioValue
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
      // Unique constraint violation
      const target = error?.meta?.target
      if (Array.isArray(target) && target.includes("username")) {
        throw new Error("Username is already taken")
      }
      if (Array.isArray(target) && target.includes("email")) {
        throw new Error("Email is already in use")
      }
    }
    
    throw new Error(error?.message || "Failed to update profile")
  }
}

/**
 * Delete user account and all associated data
 * This permanently deletes:
 * - All user's products (and their images, comments, upvotes)
 * - All user's comments
 * - All user's upvotes
 * - All user's follow relationships
 * - All reports made by or about the user
 * - User's accounts, sessions, and profile
 */
export async function deleteUserAccount() {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete your account")
  }

  const userId = session.user.id

  try {
    // Get user's products before deletion (to delete associated data)
    const userProducts = await prismaAny.software.findMany({
      where: { makerId: userId },
      select: { id: true },
    })

    const productIds = userProducts.map((p: any) => p.id)

    // Delete all comments on user's products (these will cascade via product deletion, but we'll be explicit)
    // Actually, when we delete products, their comments will cascade automatically
    
    // Delete all user's products (this will cascade delete product images, comments on products, upvotes on products)
    if (productIds.length > 0) {
      await prismaAny.software.deleteMany({
        where: { id: { in: productIds } },
      })
    }

    // Delete all user's comments (comments where authorId = userId)
    await prismaAny.comment.deleteMany({
      where: { authorId: userId },
    })

    // Delete all user's upvotes (these will cascade automatically, but being explicit)
    await prismaAny.upvote.deleteMany({
      where: { userId },
    })

    // Delete all follow relationships (where user is follower or following)
    await prismaAny.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId },
          { followingId: userId },
        ],
      },
    })

    // Delete all reports made by the user
    await prismaAny.report.deleteMany({
      where: { reporterId: userId },
    })

    // Delete all reports about the user
    await prismaAny.report.deleteMany({
      where: { reportedUserId: userId },
    })

    // Finally, delete the user (this will cascade delete accounts and sessions)
    await prismaAny.user.delete({
      where: { id: userId },
    })

    // Revalidate all relevant paths
    revalidatePath("/")
    revalidatePath("/search")

    // Note: We can't redirect here in a server action, so the component will handle it
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user account:", {
      error,
      message: error?.message,
      code: error?.code,
      userId,
    })
    
    throw new Error(error?.message || "Failed to delete account. Please try again.")
  }
}
