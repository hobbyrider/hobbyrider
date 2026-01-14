"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

export async function createComment(
  productId: string,
  content: string
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to comment")
  }

  const sanitizedContent = sanitizeInput(content, 2000)
  
  if (!sanitizedContent) {
    throw new Error("Content is required")
  }

  // Get user for backward compatibility
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  })

  await prisma.comment.create({
    data: {
      content: sanitizedContent,
      author: user?.username || user?.name || "Unknown", // Backward compatibility
      authorId: session.user.id,
      productId,
    },
  })

  revalidatePath(`/product/${productId}`)
}

export async function deleteComment(commentId: string, productId: string) {
  await prisma.comment.delete({
    where: { id: commentId },
  })

  revalidatePath(`/product/${productId}`)
}
