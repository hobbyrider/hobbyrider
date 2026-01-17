"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { revalidatePath } from "next/cache"

// NOTE: We cast Prisma client to `any` to avoid occasional stale Prisma type issues
const prismaAny = prisma as any

export async function toggleFollow(followingId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("You must be logged in to follow users")
  }

  if (session.user.id === followingId) {
    throw new Error("You cannot follow yourself")
  }

  // Check if follow relationship already exists
  const existingFollow = await prismaAny.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: followingId,
      },
    },
  })

  if (existingFollow) {
    // Unfollow: remove the follow relationship
    await prismaAny.follow.delete({
      where: { id: existingFollow.id },
    })
  } else {
    // Follow: create the follow relationship
    await prismaAny.follow.create({
      data: {
        followerId: session.user.id,
        followingId: followingId,
      },
    })
  }

  // Revalidate profile pages
  const user = await prismaAny.user.findUnique({
    where: { id: followingId },
    select: { username: true },
  })

  revalidatePath(`/user/${user?.username || followingId}`)
  revalidatePath(`/user/${session.user.username || session.user.id}`)

  return { followed: !existingFollow }
}

export async function getFollowStatus(followerId: string | null, followingId: string): Promise<boolean> {
  if (!followerId) return false

  const follow = await prismaAny.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: followerId,
        followingId: followingId,
      },
    },
  })

  return !!follow
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const [followersCount, followingCount] = await Promise.all([
    prismaAny.follow.count({
      where: { followingId: userId },
    }),
    prismaAny.follow.count({
      where: { followerId: userId },
    }),
  ])

  return {
    followers: followersCount,
    following: followingCount,
  }
}
