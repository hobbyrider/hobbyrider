"use client"

import { useState, useTransition } from "react"
import { updateComment, deleteComment } from "@/app/actions/comments"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { ReportButton } from "@/app/components/report-button"
import { getRelativeTime } from "@/lib/utils"
import toast from "react-hot-toast"

type CommentItemProps = {
  comment: {
    id: string
    content: string
    createdAt: Date
    author?: string | null
    authorUser?: {
      id: string
      username: string | null
      name: string | null
      image: string | null
    } | null
  }
  productId: string
}

export function CommentItem({ comment, productId }: CommentItemProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isOwnComment = session?.user?.id === comment.authorUser?.id

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(comment.content)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent(comment.content)
    setError(null)
  }

  const handleSave = async () => {
    if (!editContent.trim()) {
      setError("Comment cannot be empty")
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await updateComment(comment.id, editContent, productId)
        setIsEditing(false)
        toast.success("Comment updated successfully!")
        router.refresh()
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update comment"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await deleteComment(comment.id, productId)
        toast.success("Comment deleted successfully")
        router.refresh()
      } catch (err: any) {
        const errorMessage = err.message || "Failed to delete comment"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <div className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
      <div className="mb-3 space-y-2">
        {/* Avatar, Username, Time, and Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {comment.authorUser ? (
            <>
              {comment.authorUser.image ? (
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 relative">
                  <Image
                    src={comment.authorUser.image}
                    alt={comment.authorUser.username || comment.authorUser.name || "User"}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 border border-gray-300 flex-shrink-0">
                  {(comment.authorUser.username || comment.authorUser.name || "?")[0].toUpperCase()}
                </div>
              )}
              <Link
                href={`/user/${comment.authorUser.username || comment.authorUser.id}`}
                className="font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                @{comment.authorUser.username || comment.authorUser.name}
              </Link>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 border border-gray-300 flex-shrink-0">
                {comment.author?.[0].toUpperCase() || "?"}
              </div>
              <Link
                href={`/builder/${comment.author}`}
                className="font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
              >
                @{comment.author}
              </Link>
            </>
          )}
          <span className="text-sm text-gray-500">
            {getRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Actions - Between username and comment */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isOwnComment && (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 rounded"
                title="Edit comment"
                aria-label="Edit comment"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm text-red-500 hover:text-red-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete comment"
                aria-label="Delete comment"
              >
                Delete
              </button>
            </>
          )}
          <ReportButton type="comment" contentId={comment.id} variant="inline" />
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full rounded-xl border-2 border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm resize-none focus:border-gray-900 focus:outline-none transition"
            disabled={isPending}
            autoFocus
          />
          {error && (
            <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !editContent.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed text-gray-700 break-words">
          {comment.content}
        </p>
      )}
    </div>
  )
}
