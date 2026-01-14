"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

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
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")

  // Check for duplicate URL
  const existing = await prisma.software.findFirst({
    where: { url },
  })
  if (existing) {
    throw new Error("A product with this URL already exists")
  }

  // Validate categories exist
  if (categoryIds.length > 0) {
    const validCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })
    if (validCategories.length !== categoryIds.length) {
      throw new Error("One or more selected categories are invalid")
    }
  }

  // Get user to set maker field for backward compatibility
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  })

  const product = await prisma.software.create({
    data: {
      name,
      tagline,
      url,
      maker: user?.username || user?.name || "Unknown", // Backward compatibility
      makerId: session.user.id,
      thumbnail,
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
  await prisma.software.update({
    where: { id },
    data: { upvotes: { increment: 1 } },
  })

  revalidatePath("/")
}

export async function deleteSoftware(id: string, adminPassword: string) {
  if (!process.env.ADMIN_PASSWORD) throw new Error("Missing ADMIN_PASSWORD")
  if (adminPassword !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized")

  await prisma.software.delete({ where: { id } })

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
  const product = await prisma.software.findUnique({
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
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")

  // Check for duplicate URL (excluding current product)
  const existing = await prisma.software.findFirst({
    where: { url },
  })
  if (existing && existing.id !== productId) {
    throw new Error("A product with this URL already exists")
  }

  // Validate categories exist
  if (categoryIds.length > 0) {
    const validCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })
    if (validCategories.length !== categoryIds.length) {
      throw new Error("One or more selected categories are invalid")
    }
  }

  // Update product
  await prisma.software.update({
    where: { id: productId },
    data: {
      name,
      tagline,
      url,
      thumbnail,
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
  const product = await prisma.software.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.makerId !== session.user.id) {
    throw new Error("You can only delete your own products")
  }

  // Delete the product (cascades will handle related data)
  await prisma.software.delete({ where: { id: productId } })

  revalidatePath("/")
  revalidatePath(`/user/${session.user.username || session.user.id}`)
}