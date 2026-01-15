"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sanitizeEmbedHtml, sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
// in editor tooling. Runtime schema is authoritative.
const prismaAny = prisma as any

export async function createSoftware(
  formData: FormData,
  returnId = false
): Promise<string | void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to submit a product")
  }

  const name = sanitizeInput(String(formData.get("name") ?? ""), 200)
  const tagline = sanitizeInput(String(formData.get("tagline") ?? ""), 500)
  const description = sanitizeInput(String(formData.get("description") ?? ""), 10000) || null
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const embedHtml = sanitizeEmbedHtml(String(formData.get("embedHtml") ?? ""), 15000) || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")

  // Check for duplicate URL
  const existing = await prismaAny.software.findFirst({
    where: { url },
  })
  if (existing) {
    throw new Error("A product with this URL already exists")
  }

  // Validate categories exist
  if (categoryIds.length > 0) {
    const validCategories = await prismaAny.category.findMany({
      where: { id: { in: categoryIds } },
    })
    if (validCategories.length !== categoryIds.length) {
      throw new Error("One or more selected categories are invalid")
    }
  }

  // Get user to set maker field for backward compatibility
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  })

  const product = await prismaAny.software.create({
    data: {
      name,
      tagline,
      description,
      url,
      maker: user?.username || user?.name || "Unknown", // Backward compatibility
      makerId: session.user.id,
      thumbnail,
      embedHtml,
      upvotes: 0,
      categories: {
        connect: categoryIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath("/")

  if (returnId) {
    return product.id
  }

  redirect("/")
}

export async function upvoteSoftware(id: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to upvote a product")
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/software.ts:95',message:'upvoteSoftware entry',data:{productId:id,userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // Toggle: if already upvoted, remove upvote. Otherwise create it.
  let existingUpvote
  try {
    existingUpvote = await prismaAny.upvote.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id,
        },
      },
      select: { id: true },
    })
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/software.ts:108',message:'Upvote findUnique success',data:{found:!!existingUpvote},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/actions/software.ts:111',message:'Upvote findUnique error',data:{error:err?.message||String(err),code:err?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    throw err
  }

  if (existingUpvote) {
    await prismaAny.$transaction([
      prismaAny.upvote.delete({ where: { id: existingUpvote.id } }),
      // Decrement, but never below 0 (safety in case counts drift)
      prismaAny.software.updateMany({
        where: { id, upvotes: { gt: 0 } },
        data: { upvotes: { decrement: 1 } },
      }),
    ])
  } else {
    await prismaAny.$transaction([
      prismaAny.upvote.create({
        data: {
          userId: session.user.id,
          productId: id,
        },
      }),
      prismaAny.software.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      }),
    ])
  }

  revalidatePath("/")
  revalidatePath(`/product/${id}`)
}

export async function deleteSoftware(id: string, adminPassword: string) {
  if (!process.env.ADMIN_PASSWORD) throw new Error("Missing ADMIN_PASSWORD")
  if (adminPassword !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized")

  await prismaAny.software.delete({ where: { id } })

  revalidatePath("/")
}

export async function updateSoftware(
  productId: string,
  formData: FormData
): Promise<void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to edit a product")
  }

  // Verify the user is the creator
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.makerId !== session.user.id) {
    throw new Error("You can only edit your own products")
  }

  const name = sanitizeInput(String(formData.get("name") ?? ""), 200)
  const tagline = sanitizeInput(String(formData.get("tagline") ?? ""), 500)
  const description = sanitizeInput(String(formData.get("description") ?? ""), 10000) || null
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const embedHtml = sanitizeEmbedHtml(String(formData.get("embedHtml") ?? ""), 15000) || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")

  // Check for duplicate URL (excluding current product)
  const existing = await prismaAny.software.findFirst({
    where: { url },
  })
  if (existing && existing.id !== productId) {
    throw new Error("A product with this URL already exists")
  }

  // Validate categories exist
  if (categoryIds.length > 0) {
    const validCategories = await prismaAny.category.findMany({
      where: { id: { in: categoryIds } },
    })
    if (validCategories.length !== categoryIds.length) {
      throw new Error("One or more selected categories are invalid")
    }
  }

  // Update product
  await prismaAny.software.update({
    where: { id: productId },
    data: {
      name,
      tagline,
      description,
      url,
      thumbnail,
      embedHtml,
      categories: {
        set: [], // Clear existing categories
        connect: categoryIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath("/")
  revalidatePath(`/product/${productId}`)
  revalidatePath(`/user/${session.user.username || session.user.id}`)
}

export async function deleteSoftwareByCreator(productId: string): Promise<void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a product")
  }

  // Verify the user is the creator
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.makerId !== session.user.id) {
    throw new Error("You can only delete your own products")
  }

  // Delete the product (cascades will handle related data)
  await prismaAny.software.delete({ where: { id: productId } })

  revalidatePath("/")
  revalidatePath(`/user/${session.user.username || session.user.id}`)
}