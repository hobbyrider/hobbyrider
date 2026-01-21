"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sanitizeEmbedHtml, sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { sendUpvoteNotification } from "@/lib/email"
import { generateSlug, getProductUrl } from "@/lib/slug"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.io"
}

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
// in editor tooling. Runtime schema is authoritative.
const prismaAny = prisma as any

/**
 * Get product URL for revalidation (handles products without slugs)
 * This is a helper function for revalidation paths
 */
async function getProductUrlForRevalidation(productId: string): Promise<string> {
  try {
    const product = await prismaAny.software.findUnique({
      where: { id: productId },
      select: { slug: true, id: true },
    })
    if (product) {
      return getProductUrl(product.slug, product.id)
    }
  } catch (error) {
    // Fallback to old format if product not found
  }
  return `/product/${productId}`
}

/**
 * Get product URL with base URL for emails/notifications
 */
async function getProductFullUrlForNotification(productId: string): Promise<string> {
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
    select: { slug: true, id: true },
  })
  if (product) {
    return `${getBaseUrl()}${getProductUrl(product.slug, product.id)}`
  }
  return `${getBaseUrl()}/product/${productId}`
}

export async function createSoftware(
  formData: FormData,
  returnId = false
): Promise<string | void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to submit a product")
  }

  const name = sanitizeInput(String(formData.get("name") ?? ""), 40)
  let tagline = sanitizeInput(String(formData.get("tagline") ?? ""), 70).trim()
  
  // Ensure tagline ends with a period
  if (tagline && !tagline.endsWith('.')) {
    if (tagline.length < 70) {
      tagline = tagline + '.'
    } else {
      tagline = tagline.slice(0, 69) + '.'
    }
  }
  
  // Allow markdown in description, but strip HTML tags for security
  const descriptionRaw = String(formData.get("description") ?? "").trim()
  const descriptionClean = descriptionRaw.replace(/<[^>]*>/g, "") // Strip HTML tags (markdown is preserved)
  const description = sanitizeInput(descriptionClean, 800) || null
  
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const embedHtml = sanitizeEmbedHtml(String(formData.get("embedHtml") ?? ""), 800) || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")
  
  // Validate URL length
  if (url.length > 40) {
    throw new Error("URL must be 40 characters or less")
  }
  
  // Validate URL starts with https://
  if (!url.startsWith("https://")) {
    throw new Error("URL must start with https://")
  }
  
  // Reject URL shorteners
  const shortenerDomains = [
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", 
    "is.gd", "buff.ly", "short.link", "rebrand.ly", "cutt.ly"
  ]
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (shortenerDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
      throw new Error("URL shorteners are not allowed. Please use the full URL.")
    }
  } catch (error: any) {
    if (error.message.includes("URL shorteners")) throw error
    throw new Error("Invalid URL format")
  }

  // Check for duplicate URL
  const existing = await prismaAny.software.findFirst({
    where: { url },
  })
  if (existing) {
    throw new Error("A product with this URL already exists. Please submit a different product.")
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

  // Generate slug from product name
  const slug = generateSlug(name)

  const product = await prismaAny.software.create({
    data: {
      name,
      slug, // Store slug for canonical URLs
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
  revalidatePath(getProductUrl(product.slug, product.id))

  if (returnId) {
    return product.id
  }

  // Redirect to canonical product URL
  redirect(getProductUrl(product.slug, product.id))
}

export async function upvoteSoftware(id: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to upvote a product")
  }

  // Toggle: if already upvoted, remove upvote. Otherwise create it.
  const existingUpvote = await prismaAny.upvote.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: id,
      },
    },
    select: { id: true },
  })

  if (existingUpvote) {
    // Removing upvote - no rate limit check needed
    await prismaAny.$transaction([
      prismaAny.upvote.delete({ where: { id: existingUpvote.id } }),
      // Decrement, but never below 0 (safety in case counts drift)
      prismaAny.software.updateMany({
        where: { id, upvotes: { gt: 0 } },
        data: { upvotes: { decrement: 1 } },
      }),
    ])
  } else {
    // Creating new upvote - check rate limit
    const rateLimit = await checkRateLimit(
      session.user.id,
      "upvote",
      RATE_LIMITS.upvote
    )
    if (!rateLimit.allowed) {
      throw new Error(rateLimit.error || "Rate limit exceeded for upvotes")
    }

    // Get product and owner info for email notification
    const product = await prismaAny.software.findUnique({
      where: { id },
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

    // Send email notification to product owner (if different from upvoter and notifications enabled)
    if (product?.makerUser?.email && product.makerUser.id !== session.user.id) {
      // Check if product owner has upvote notifications enabled
      const productOwner = await prismaAny.user.findUnique({
        where: { id: product.makerUser.id },
        select: { notifyOnUpvotes: true, username: true },
      })

      if (productOwner?.notifyOnUpvotes !== false) {
        const baseUrl = getBaseUrl()
        const productUrl = await getProductFullUrlForNotification(id)
        const profileSettingsUrl = `${baseUrl}/user/${productOwner.username || product.makerUser.id}/edit#notifications`
        const upvoter = await prismaAny.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, username: true },
        })
        const upvoterName = upvoter?.name || upvoter?.username || "Someone"
        
        // Send email asynchronously (don't block the response)
        sendUpvoteNotification({
          productOwnerEmail: product.makerUser.email,
          productOwnerName: product.makerUser.name || product.makerUser.username || "User",
          productOwnerId: product.makerUser.id,
          productOwnerUsername: productOwner?.username || null,
          productName: product.name,
          productId: product.id,
          upvoterName,
          productUrl,
          profileSettingsUrl,
        }).catch((error) => {
          // Log error but don't fail the upvote
          console.error("Failed to send upvote notification email:", error)
        })
      }
    }
  }

  revalidatePath("/")
  const productPath = await getProductUrlForRevalidation(id)
  revalidatePath(productPath)
  revalidatePath(`/product/${id}`) // Keep old path for backward compatibility
}

export async function deleteSoftware(id: string, adminPassword: string) {
  if (!process.env.ADMIN_PASSWORD) throw new Error("Missing ADMIN_PASSWORD")
  if (adminPassword !== process.env.ADMIN_PASSWORD) throw new Error("Unauthorized")

  await prismaAny.software.delete({ where: { id } })

  revalidatePath("/")
}

/**
 * Delete a product as an admin (checks admin status, not password)
 */
export async function deleteSoftwareAsAdmin(productId: string): Promise<void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a product")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Unauthorized: Only admins can delete products")
  }

  const product = await prismaAny.software.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Delete the product (cascades will handle related data)
  await prismaAny.software.delete({ where: { id: productId } })

  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/admin/moderation")
  const productPath = await getProductUrlForRevalidation(productId)
  revalidatePath(productPath)
  revalidatePath(`/product/${productId}`) // Keep old path for backward compatibility
}

export async function updateSoftware(
  productId: string,
  formData: FormData
): Promise<void> {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to edit a product")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  // Verify the user is the creator or an admin
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.makerId !== session.user.id && !user?.isAdmin) {
    throw new Error("You can only edit your own products")
  }

  const name = sanitizeInput(String(formData.get("name") ?? ""), 40)
  let tagline = sanitizeInput(String(formData.get("tagline") ?? ""), 70).trim()
  
  // Ensure tagline ends with a period
  if (tagline && !tagline.endsWith('.')) {
    if (tagline.length < 70) {
      tagline = tagline + '.'
    } else {
      tagline = tagline.slice(0, 69) + '.'
    }
  }
  
  // Allow markdown in description, but strip HTML tags for security
  const descriptionRaw = String(formData.get("description") ?? "").trim()
  const descriptionClean = descriptionRaw.replace(/<[^>]*>/g, "") // Strip HTML tags (markdown is preserved)
  const description = sanitizeInput(descriptionClean, 800) || null
  
  const url = String(formData.get("url") ?? "").trim()
  const thumbnail = String(formData.get("thumbnail") ?? "").trim() || null
  const embedHtml = sanitizeEmbedHtml(String(formData.get("embedHtml") ?? ""), 800) || null
  const categoryIds = formData.getAll("categories") as string[]

  if (!name || !tagline || !url) throw new Error("Missing fields")
  
  // Validate URL length
  if (url.length > 40) {
    throw new Error("URL must be 40 characters or less")
  }
  
  // Validate URL starts with https://
  if (!url.startsWith("https://")) {
    throw new Error("URL must start with https://")
  }
  
  // Reject URL shorteners
  const shortenerDomains = [
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", 
    "is.gd", "buff.ly", "short.link", "rebrand.ly", "cutt.ly"
  ]
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (shortenerDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
      throw new Error("URL shorteners are not allowed. Please use the full URL.")
    }
  } catch (error: any) {
    if (error.message.includes("URL shorteners")) throw error
    throw new Error("Invalid URL format")
  }

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

  // Update product (slug is NOT updated automatically - URLs remain stable)
  // Only update slug if name changed significantly and explicitly requested
  await prismaAny.software.update({
    where: { id: productId },
    data: {
      name,
      tagline,
      description,
      url,
      thumbnail,
      embedHtml,
      // Note: slug is intentionally NOT updated here to maintain stable URLs
      // If slug update is needed, it should be explicit and require a separate action
      categories: {
        set: [], // Clear existing categories
        connect: categoryIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath("/")
  const productPath = await getProductUrlForRevalidation(productId)
  revalidatePath(productPath)
  revalidatePath(`/product/${productId}`) // Keep old path for backward compatibility
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

/**
 * Get all products with ownership info (admin only)
 */
export async function getAllProductsForAdmin() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can view all products")
  }

  const products = await prismaAny.software.findMany({
    select: {
      id: true,
      name: true,
      slug: true, // Include slug for canonical URLs
      url: true,
      ownershipStatus: true,
      seededBy: true,
      makerId: true,
      makerUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      seededByUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return products
}

/**
 * Get all products with stats for visibility management (admin only)
 */
export async function getAllProductsWithStats() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can view all products")
  }

  const products = await prismaAny.software.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      url: true,
      ownershipStatus: true,
      seededBy: true,
      makerId: true,
      viewCount: true,
      upvotes: true,
      makerUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      seededByUser: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return products
}

/**
 * Update product stats (viewCount and upvotes) - admin only
 */
export async function updateProductStats(
  productId: string,
  viewCount: number | null,
  upvotes: number | null
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can update product stats")
  }

  // Validate input
  if (viewCount !== null && (viewCount < 0 || !Number.isInteger(viewCount))) {
    throw new Error("View count must be a non-negative integer")
  }

  if (upvotes !== null && (upvotes < 0 || !Number.isInteger(upvotes))) {
    throw new Error("Upvotes must be a non-negative integer")
  }

  // Check if product exists
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Update stats (only update provided values)
  const updateData: any = {}
  if (viewCount !== null) {
    updateData.viewCount = viewCount
  }
  if (upvotes !== null) {
    updateData.upvotes = upvotes
  }

  await prismaAny.software.update({
    where: { id: productId },
    data: updateData,
  })

  // Revalidate relevant paths
  revalidatePath("/admin")
  revalidatePath("/admin?tab=visibility")
  const productPath = await getProductUrlForRevalidation(productId)
  revalidatePath(productPath)
  revalidatePath(`/product/${productId}`)
  revalidatePath("/")
}

/**
 * Update product ownership status (admin only)
 */
export async function updateProductOwnershipStatus(
  productId: string,
  ownershipStatus: "seeded" | "owned"
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    throw new Error("Only admins can update product ownership status")
  }

  // Update product
  await prismaAny.software.update({
    where: { id: productId },
    data: {
      ownershipStatus,
      seededBy: ownershipStatus === "seeded" ? session.user.id : null,
    },
  })

  revalidatePath(`/product/${productId}`)
  revalidatePath("/")
  revalidatePath("/admin/moderation")

  return { success: true }
}