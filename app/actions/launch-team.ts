"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
const prismaAny = prisma as any

export type LaunchTeamMemberInput = {
  userId?: string | null
  name: string
  role?: string | null
  isExternal: boolean
}

/**
 * Update launch team for a product (owner or admin only)
 */
export async function updateLaunchTeam(
  productId: string,
  members: LaunchTeamMemberInput[]
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in")
  }

  // Get product to check ownership
  const product = await prismaAny.software.findUnique({
    where: { id: productId },
    select: {
      makerId: true,
      ownershipStatus: true,
    },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  // Check if user is admin
  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  // Only owner or admin can edit launch team
  const isOwner = product.makerId === session.user.id
  const isAdmin = user?.isAdmin

  if (!isOwner && !isAdmin) {
    throw new Error("Only the product owner or admin can edit the launch team")
  }

  // Validate and sanitize members
  const sanitizedMembers = members.map((member, index) => {
    if (!member.name || member.name.trim().length === 0) {
      throw new Error(`Member ${index + 1}: Name is required`)
    }

    const sanitizedName = sanitizeInput(member.name, 100)
    const sanitizedRole = member.role ? sanitizeInput(member.role, 50) : null

    // If userId is provided, verify it exists
    if (member.userId && !member.isExternal) {
      // Will be validated in transaction
    }

    return {
      userId: member.userId || null,
      name: sanitizedName,
      role: sanitizedRole,
      isExternal: member.isExternal || !member.userId,
      order: index,
    }
  })

  // Update launch team in transaction
  await prismaAny.$transaction([
    // Delete existing members
    prismaAny.launchTeamMember.deleteMany({
      where: { productId },
    }),
    // Create new members
    ...sanitizedMembers.map((member) =>
      prismaAny.launchTeamMember.create({
        data: {
          productId,
          userId: member.userId,
          name: member.name,
          role: member.role,
          isExternal: member.isExternal,
          order: member.order,
        },
      })
    ),
  ])

  revalidatePath(`/product/${productId}`)

  return { success: true }
}

/**
 * Get launch team for a product
 */
export async function getLaunchTeam(productId: string) {
  const members = await prismaAny.launchTeamMember.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { order: "asc" },
  })

  return members
}
