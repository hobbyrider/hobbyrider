"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { sendCommentNotification } from "@/lib/email"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

export async function createComment(
  productId: string,
  content: string
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to comment")
  }

  const sanitizedContent = sanitizeInput(content, 2000)
  
  if (!sanitizedContent || sanitizedContent.trim().length === 0) {
    throw new Error("Please enter a comment before submitting")
  }

  // Check rate limit for comments
  const rateLimit = await checkRateLimit(
    session.user.id,
    "comment",
    RATE_LIMITS.comment
  )
  if (!rateLimit.allowed) {
    throw new Error(rateLimit.error || "Rate limit exceeded for comments")
  }

  // Get user for backward compatibility
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  })
  
  // Get product and owner info for email notification
  const product = await prisma.software.findUnique({
    where: { id: productId },
    include: {
      makerUser: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
        },
      },
    },
  })

  // Create the comment
  await prisma.comment.create({
    data: {
      content: sanitizedContent,
      author: user?.username || user?.name || "Unknown", // Backward compatibility
      authorId: session.user.id,
      productId,
    },
  })

  // Send email notification to product owner (if different from commenter and notifications enabled)
  if (product?.makerUser?.email && product.makerUser.id !== session.user.id) {
    // Check if product owner has comment notifications enabled
    const productOwner = await prisma.user.findUnique({
      where: { id: product.makerUser.id },
      select: { notifyOnComments: true, username: true },
    })

    if (productOwner?.notifyOnComments !== false) {
      const baseUrl = getBaseUrl()
      const commentUrl = `${baseUrl}/product/${productId}#comments`
      const profileSettingsUrl = `${baseUrl}/user/${productOwner?.username || product.makerUser.id}/edit#notifications`
      const commenterName = user?.name || user?.username || "Someone"
      
      // Send email asynchronously (don't block the response)
      sendCommentNotification({
        productOwnerEmail: product.makerUser.email,
        productOwnerName: product.makerUser.name || product.makerUser.username || "User",
        productOwnerId: product.makerUser.id,
        productOwnerUsername: productOwner?.username || null,
        productName: product.name,
        productId: product.id,
        commenterName,
        commentContent: sanitizedContent,
        commentUrl,
        profileSettingsUrl,
      }).catch((error) => {
        // Log error but don't fail the comment creation
        console.error("Failed to send comment notification email:", error)
      })
    }
  }

  revalidatePath(`/product/${productId}`)
}

export async function updateComment(
  commentId: string,
  content: string,
  productId: string
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to edit comments")
  }

  // Check if comment exists and user owns it
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  if (!comment) {
    throw new Error("Comment not found")
  }

  if (comment.authorId !== session.user.id) {
    throw new Error("You can only edit your own comments")
  }

  const sanitizedContent = sanitizeInput(content, 2000)
  if (!sanitizedContent) {
    throw new Error("Content is required")
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: sanitizedContent },
  })

  revalidatePath(`/product/${productId}`)
}

export async function deleteComment(commentId: string, productId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete comments")
  }

  // Check if comment exists and user owns it
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  if (!comment) {
    throw new Error("Comment not found")
  }

  if (comment.authorId !== session.user.id) {
    throw new Error("You can only delete your own comments")
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  revalidatePath(`/product/${productId}`)
}
