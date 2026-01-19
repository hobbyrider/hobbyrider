"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
const prismaAny = prisma as any

/**
 * Request ownership of a seeded product
 */
export async function requestOwnership(productId: string, reason: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to request ownership")
  }

  // Get product
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
    select: { ownershipStatus: true, makerId: true, seededBy: true },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Allow claims on seeded products OR products that were seeded (even if now "owned" by admin)
  if (product.ownershipStatus !== "seeded" && !product.seededBy) {
    throw new Error("This product is not available for ownership claims")
  }

  // Check if user already has a pending claim
  const existingClaim = await prismaAny.ownershipClaim.findFirst({
    where: {
      productId,
      claimantId: session.user.id,
      status: "pending",
    },
  })

  if (existingClaim) {
    throw new Error("You already have a pending ownership claim for this product")
  }

  // Sanitize reason
  const sanitizedReason = sanitizeInput(reason, 1000)
  if (!sanitizedReason || sanitizedReason.trim().length < 10) {
    throw new Error("Please provide a reason (at least 10 characters)")
  }

  // Create claim
  await prismaAny.ownershipClaim.create({
    data: {
      productId,
      claimantId: session.user.id,
      reason: sanitizedReason,
      status: "pending",
    },
  })

  // Update product status to "claimed" if it was "seeded"
  await prismaAny.software.update({
    where: { id: productId },
    data: { ownershipStatus: "claimed" },
  })

  revalidatePath(`/product/${productId}`)
  revalidatePath("/admin/ownership-claims")
  revalidatePath("/admin/moderation")

  return { success: true }
}

/**
 * Review an ownership claim (admin only)
 */
export async function reviewOwnershipClaim(
  claimId: string,
  action: "approve" | "reject",
  adminNotes?: string
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
    throw new Error("Only admins can review ownership claims")
  }

  // Get claim
  const claim = await prismaAny.ownershipClaim.findUnique({
    where: { id: claimId },
    include: {
      product: {
        select: { id: true, ownershipStatus: true },
      },
    },
  })

  if (!claim) {
    throw new Error("Ownership claim not found")
  }

  if (claim.status !== "pending") {
    throw new Error("This claim has already been reviewed")
  }

  const sanitizedNotes = adminNotes ? sanitizeInput(adminNotes, 500) : null

  if (action === "approve") {
    // Approve claim: transfer ownership
    await prismaAny.$transaction([
      // Update product ownership
      prismaAny.software.update({
        where: { id: claim.productId },
        data: {
          makerId: claim.claimantId,
          ownershipStatus: "owned",
          // Update legacy maker field for backward compatibility
          maker: null, // Will be populated from user data
        },
      }),
      // Update claim status
      prismaAny.ownershipClaim.update({
        where: { id: claimId },
        data: {
          status: "approved",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          adminNotes: sanitizedNotes,
        },
      }),
      // Reject all other pending claims for this product
      prismaAny.ownershipClaim.updateMany({
        where: {
          productId: claim.productId,
          id: { not: claimId },
          status: "pending",
        },
        data: {
          status: "rejected",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      }),
    ])

    // Update legacy maker field from user data
    const newOwner = await prismaAny.user.findUnique({
      where: { id: claim.claimantId },
      select: { username: true, name: true },
    })

    if (newOwner) {
      await prismaAny.software.update({
        where: { id: claim.productId },
        data: {
          maker: newOwner.username || newOwner.name || "Unknown",
        },
      })
    }
  } else {
    // Reject claim
    await prismaAny.ownershipClaim.update({
      where: { id: claimId },
      data: {
        status: "rejected",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        adminNotes: sanitizedNotes,
      },
    })

    // If this was the only pending claim, revert product to "seeded"
    const pendingCount = await prismaAny.ownershipClaim.count({
      where: {
        productId: claim.productId,
        status: "pending",
      },
    })

    if (pendingCount === 0) {
      await prismaAny.software.update({
        where: { id: claim.productId },
        data: { ownershipStatus: "seeded" },
      })
    }
  }

  revalidatePath(`/product/${claim.productId}`)
  revalidatePath("/admin/ownership-claims")

  return { success: true }
}

/**
 * Get pending ownership claims (admin only)
 */
export async function getPendingOwnershipClaims() {
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
    throw new Error("Only admins can view ownership claims")
  }

  const claims = await prismaAny.ownershipClaim.findMany({
    where: { status: "pending" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true, // Include slug for canonical URLs
          url: true,
          thumbnail: true,
          ownershipStatus: true,
        },
      },
      claimant: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return claims
}

/**
 * Get ownership claim for a product (for UI display)
 */
export async function getProductOwnershipClaim(productId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }

  const claim = await prismaAny.ownershipClaim.findFirst({
    where: {
      productId,
      claimantId: session.user.id,
      status: "pending",
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  })

  return claim
}
