"use client"

import { useTransition } from "react"
import { upvoteSoftware } from "@/app/actions/software"
import { useRouter } from "next/navigation"

export function UpvoteButton({ id, upvotes }: { id: string; upvotes: number }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpvote = () => {
    startTransition(async () => {
      await upvoteSoftware(id)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleUpvote}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border px-3 py-1 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-sm font-semibold">{upvotes}</span>
      <span className="text-sm text-gray-600">
        {isPending ? "..." : "upvotes"}
      </span>
    </button>
  )
}
