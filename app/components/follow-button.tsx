"use client"

import { useState, useTransition } from "react"
import { toggleFollow } from "@/app/actions/follow"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { trackEvent, captureException } from "@/lib/posthog"

type FollowButtonProps = {
  userId: string
  isFollowing: boolean
  isOwnProfile: boolean
}

export function FollowButton({ userId, isFollowing: initialIsFollowing, isOwnProfile }: FollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  if (isOwnProfile) {
    return null // Don't show follow button on own profile
  }

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleFollow(userId)
        setIsFollowing(result.followed)
        // Track follow/unfollow event
        trackEvent(result.followed ? "user_followed" : "user_unfollowed", {
          followed_user_id: userId,
        })
        router.refresh()
        toast.success(result.followed ? "Following" : "Unfollowed")
      } catch (error: any) {
        captureException(error, { context: "follow_toggle", userId })
        toast.error(error.message || "Failed to follow user")
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center justify-center w-full sm:w-auto rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400"
          : "border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {isPending ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  )
}
