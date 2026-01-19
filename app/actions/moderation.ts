"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeInput } from "@/lib/utils"
import { getSession } from "@/lib/get-session"

const prismaAny = prisma as any

export type ReportReason = 
  | "spam"
  | "inappropriate"
  | "misleading"
  | "copyright"
  | "harassment"
  | "other"

export async function reportContent(
  type: "product" | "comment" | "user",
  contentId: string,
  reason: ReportReason,
  details?: string
) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to report content")
  }

  // Prevent users from reporting themselves
  if (type === "user" && contentId === session.user.id) {
    throw new Error("You cannot report yourself")
  }

  // Check if user already reported this content
  const existingReport = await prismaAny.report.findFirst({
    where: {
      reporterId: session.user.id,
      ...(type === "product" 
        ? { productId: contentId } 
        : type === "comment" 
        ? { commentId: contentId }
        : { reportedUserId: contentId }),
    },
  })

  if (existingReport) {
    throw new Error("You have already reported this content")
  }

  const sanitizedDetails = details ? sanitizeInput(details, 500) : null

  await prismaAny.report.create({
    data: {
      reporterId: session.user.id,
      ...(type === "product" 
        ? { productId: contentId } 
        : type === "comment" 
        ? { commentId: contentId }
        : { reportedUserId: contentId }),
      reason: sanitizedDetails || reason,
      status: "pending",
    },
  })

  revalidatePath("/")
  return { success: true }
}

export async function getReports(
  status?: "pending" | "reviewed" | "dismissed" | "resolved",
  includeArchived: boolean = false
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
    throw new Error("You must be an admin to view reports")
  }

  const where: any = {}
  if (status) {
    where.status = status
  }
  if (!includeArchived) {
    where.isArchived = false
  }

  const reports = await prismaAny.report.findMany({
    where,
    select: {
      id: true,
      reason: true,
      status: true,
      isArchived: true,
      createdAt: true,
      reviewedAt: true,
      reporter: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true, // Include slug for canonical URLs
          tagline: true,
          url: true,
          isHidden: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
          isHidden: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true, // Include slug for canonical URLs
            },
          },
        },
      },
      reportedUser: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return reports
}

export async function reviewReport(
  reportId: string,
  action: "dismiss" | "hide" | "remove",
  notes?: string
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
    throw new Error("You must be an admin to review reports")
  }

  const report = await prismaAny.report.findUnique({
    where: { id: reportId },
    include: {
      product: true,
      comment: true,
    },
  })

  if (!report) {
    throw new Error("Report not found")
  }

  // Update report status
  const status = action === "dismiss" ? "dismissed" : "resolved"
  await prismaAny.report.update({
    where: { id: reportId },
    data: {
      status,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  })

  // Take action on content
  if (action === "hide" || action === "remove") {
    if (report.productId) {
      await prismaAny.software.update({
        where: { id: report.productId },
        data: {
          isHidden: action === "hide",
          ...(action === "remove" ? { name: "[Removed]", tagline: "[Content removed by moderation]", description: null } : {}),
        },
      })
    } else if (report.commentId) {
      await prismaAny.comment.update({
        where: { id: report.commentId },
        data: {
          isHidden: action === "hide",
          ...(action === "remove" ? { content: "[Removed]" } : {}),
        },
      })
    } else if (report.reportedUserId) {
      // For user reports, we can't "hide" a user, but we can note it for admin review
      // In a full implementation, you might want to add a "isBanned" or "isSuspended" field
      // For now, we'll just mark the report as resolved
      // You could also delete the user account if action === "remove"
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/moderation")
  if (report.productId) {
    revalidatePath(`/product/${report.productId}`)
  }

  return { success: true }
}

export async function manageContent(
  type: "product" | "comment",
  contentId: string,
  action: "unhide" | "delete"
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
    throw new Error("You must be an admin to manage content")
  }

  if (type === "product") {
    if (action === "unhide") {
      await prismaAny.software.update({
        where: { id: contentId },
        data: { isHidden: false },
      })
    } else if (action === "delete") {
      await prismaAny.software.delete({
        where: { id: contentId },
      })
    }
  } else if (type === "comment") {
    if (action === "unhide") {
      await prismaAny.comment.update({
        where: { id: contentId },
        data: { isHidden: false },
      })
    } else if (action === "delete") {
      await prismaAny.comment.delete({
        where: { id: contentId },
      })
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/moderation")
  if (type === "product") {
    revalidatePath(`/product/${contentId}`)
  }

  return { success: true }
}

export async function archiveReport(reportId: string, archive: boolean = true) {
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
    throw new Error("You must be an admin to archive reports")
  }

  await prismaAny.report.update({
    where: { id: reportId },
    data: { isArchived: archive },
  })

  revalidatePath("/admin/moderation")
  return { success: true }
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  if (!session?.user?.id) {
    return false
  }

  const user = await prismaAny.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  return user?.isAdmin || false
}
