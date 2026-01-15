"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

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
  
  if (!sanitizedContent) {
    throw new Error("Content is required")
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
