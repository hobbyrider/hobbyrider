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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:8',message:'createComment entry',data:{productId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  let session
  try {
    session = await getSession()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:12',message:'getSession in createComment',data:{hasSession:!!session,userId:session?.user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:16',message:'getSession error in createComment',data:{error:err?.message||String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    throw new Error("You must be logged in to comment")
  }
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:25',message:'Before user query',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  // Get user for backward compatibility
  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, name: true },
    })
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:32',message:'User query result',data:{found:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:35',message:'User query error',data:{error:err?.message||String(err),code:err?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    throw err
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/comments.ts:40',message:'Before comment create',data:{productId,hasAuthorId:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
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

  // Send email notification to product owner (if different from commenter)
  if (product?.makerUser?.email && product.makerUser.id !== session.user.id) {
    const baseUrl = getBaseUrl()
    const commentUrl = `${baseUrl}/product/${productId}#comments`
    const commenterName = user?.name || user?.username || "Someone"
    
    // Send email asynchronously (don't block the response)
    sendCommentNotification({
      productOwnerEmail: product.makerUser.email,
      productOwnerName: product.makerUser.name || product.makerUser.username || "User",
      productName: product.name,
      productId: product.id,
      commenterName,
      commentContent: sanitizedContent,
      commentUrl,
    }).catch((error) => {
      // Log error but don't fail the comment creation
      console.error("Failed to send comment notification email:", error)
    })
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
