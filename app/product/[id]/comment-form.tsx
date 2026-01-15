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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask a question or leave a comment..."
          rows={4}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm resize-none focus:border-black focus:outline-none transition"
          required
          disabled={submitting}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-lg bg-black text-white px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  )
}
