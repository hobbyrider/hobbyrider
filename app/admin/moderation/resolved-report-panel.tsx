"use client"

import { useState, useTransition } from "react"
import { manageContent, archiveReport } from "@/app/actions/moderation"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRelativeTime } from "@/lib/utils"

type ResolvedReport = {
  id: string
  reason: string
  status: string
  isArchived: boolean
  createdAt: Date
  reviewedAt: Date | null
  reporter: {
    id: string
    username: string | null
    name: string | null
    email: string
  }
  product: {
    id: string
    name: string
    tagline: string
    url: string
    isHidden: boolean
  } | null
  comment: {
    id: string
    content: string
    isHidden: boolean
    product: {
      id: string
      name: string
    }
  } | null
  reportedUser: {
    id: string
    username: string | null
    name: string | null
    email: string
    image: string | null
  } | null
}

type ResolvedReportPanelProps = {
  report: ResolvedReport
}

export function ResolvedReportPanel({ report }: ResolvedReportPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleContentAction = async (
    type: "product" | "comment",
    contentId: string,
    action: "unhide" | "delete"
  ) => {
    if (!confirm(`Are you sure you want to ${action === "unhide" ? "unhide" : "permanently delete"} this ${type}?`)) {
      return
    }

    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await manageContent(type, contentId, action)
        setSuccess(`${type === "product" ? "Product" : "Comment"} ${action === "unhide" ? "unhidden" : "deleted"} successfully`)
        setTimeout(() => {
          setSuccess(null)
          router.refresh()
        }, 2000)
      } catch (err: any) {
        setError(err.message || "Failed to process action")
      }
    })
  }

  const handleArchive = async (archive: boolean) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await archiveReport(report.id, archive)
        setSuccess(`Report ${archive ? "archived" : "unarchived"} successfully`)
        setTimeout(() => {
          setSuccess(null)
          router.refresh()
        }, 2000)
      } catch (err: any) {
        setError(err.message || "Failed to archive report")
      }
    })
  }

  return (
    <div className={`rounded-lg border p-4 ${
      report.isArchived 
        ? "border-gray-300 bg-gray-50 opacity-75" 
        : "border-gray-200 bg-white"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                report.status === "resolved"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {report.status}
            </span>
            {report.isArchived && (
              <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                Archived
              </span>
            )}
            <span className="text-sm text-gray-500">
              {getRelativeTime(report.createdAt)}
            </span>
            {report.reviewedAt && (
              <span className="text-sm text-gray-500">
                • Reviewed {getRelativeTime(report.reviewedAt)}
              </span>
            )}
          </div>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Reason:</strong> {report.reason}
          </p>
          <p className="text-xs text-gray-500">
            Reported by @{report.reporter.username || report.reporter.name || report.reporter.email}
          </p>

          {report.product && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Product
                </span>
                {report.product.isHidden && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Hidden
                  </span>
                )}
              </div>
              <Link
                href={`/product/${report.product.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                target="_blank"
              >
                {report.product.name}
              </Link>
              <p className="mt-1 text-xs text-gray-600">{report.product.tagline}</p>
              
              <div className="mt-2 flex gap-2">
                {report.product.isHidden ? (
                  <button
                    type="button"
                    onClick={() => handleContentAction("product", report.product!.id, "unhide")}
                    disabled={isPending}
                    className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unhide
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleContentAction("product", report.product!.id, "delete")}
                    disabled={isPending}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {report.comment && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Comment
                </span>
                {report.comment.isHidden && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{report.comment.content}</p>
              <Link
                href={`/product/${report.comment.product.id}`}
                className="mt-1 inline-block text-xs text-gray-500 hover:text-gray-700 hover:underline"
                target="_blank"
              >
                View product: {report.comment.product.name}
              </Link>
              
              <div className="mt-2 flex gap-2">
                {report.comment.isHidden ? (
                  <button
                    type="button"
                    onClick={() => handleContentAction("comment", report.comment!.id, "unhide")}
                    disabled={isPending}
                    className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unhide
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleContentAction("comment", report.comment!.id, "delete")}
                    disabled={isPending}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {report.reportedUser && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  User
                </span>
              </div>
              <div className="flex items-center gap-2">
                {report.reportedUser.image ? (
                  <img
                    src={report.reportedUser.image}
                    alt={report.reportedUser.username || report.reportedUser.name || "User"}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 border border-gray-300">
                    {(report.reportedUser.username || report.reportedUser.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <Link
                    href={`/user/${report.reportedUser.username || report.reportedUser.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                    target="_blank"
                  >
                    {report.reportedUser.name || report.reportedUser.username || report.reportedUser.email}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg bg-green-50 p-2 text-xs text-green-600">
          {success}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="text-xs text-gray-500">
          {report.isArchived ? "This report is archived" : "Report management"}
        </div>
        <button
          type="button"
          onClick={() => handleArchive(!report.isArchived)}
          disabled={isPending}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            report.isArchived
              ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {report.isArchived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </div>
  )
}
