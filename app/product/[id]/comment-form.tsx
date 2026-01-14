"use client"

import { createComment } from "@/app/actions/comments"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export function CommentForm({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  if (!session) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          You must be logged in to comment
        </p>
        <div className="flex gap-2 justify-center">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-black hover:text-white transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-gray-100 transition"
          >
            Sign up
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      await createComment(productId, content)
      setContent("")
      router.refresh()
    } catch (error: any) {
      console.error("Failed to create comment:", error)
      alert(error.message || "Failed to post comment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
          required
          disabled={submitting}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  )
}
