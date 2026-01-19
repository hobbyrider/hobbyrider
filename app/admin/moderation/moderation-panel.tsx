"use client"

import { useState, useTransition } from "react"
import { reviewReport } from "@/app/actions/moderation"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { getProductUrl, generateSlug } from "@/lib/slug"

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`
}

type Report = {
  id: string
  reason: string
  status: string
  createdAt: Date
  reporter: {
    id: string
    username: string | null
    name: string | null
    email: string
  }
  product: {
    id: string
    name: string
    slug: string | null // URL-friendly slug
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
      slug: string | null // URL-friendly slug
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

type ModerationPanelProps = {
  report: Report
}

export function ModerationPanel({ report }: ModerationPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = async (action: "dismiss" | "hide" | "remove") => {
    setError(null)
    startTransition(async () => {
      try {
        await reviewReport(report.id, action)
        const actionMessages = {
          dismiss: "Report dismissed",
          hide: "Content hidden successfully",
          remove: "Content removed successfully",
        }
        toast.success(actionMessages[action])
        router.refresh()
      } catch (err: any) {
        const errorMessage = err.message || "Failed to process action"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
              Pending
            </span>
            <span className="text-sm text-gray-500">
              {getRelativeTime(report.createdAt)}
            </span>
            <span className="text-sm text-gray-500">
              by @{report.reporter.username || report.reporter.name || report.reporter.email}
            </span>
          </div>
          <p className="mb-3 text-base font-medium text-gray-900">
            Reason: {report.reason}
          </p>
        </div>
      </div>

      {report.product && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
            href={getProductUrl(report.product.slug || generateSlug(report.product.name), report.product.id)}
            className="text-lg font-semibold text-gray-900 hover:text-gray-700 hover:underline"
            target="_blank"
          >
            {report.product.name}
          </Link>
          <p className="mt-1 text-sm text-gray-600">{report.product.tagline}</p>
          <a
            href={report.product.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            {report.product.url}
          </a>
        </div>
      )}

      {report.comment && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
          <p className="text-sm text-gray-700">{report.comment.content}</p>
          <Link
            href={getProductUrl(report.comment.product.slug || generateSlug(report.comment.product.name), report.comment.product.id)}
            className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-700 hover:underline"
            target="_blank"
          >
            View product: {report.comment.product.name}
          </Link>
        </div>
      )}

      {report.reportedUser && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              User
            </span>
          </div>
          <div className="flex items-center gap-3">
            {report.reportedUser.image ? (
              <img
                src={report.reportedUser.image}
                alt={report.reportedUser.username || report.reportedUser.name || "User"}
                className="h-10 w-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 border border-gray-300">
                {(report.reportedUser.username || report.reportedUser.name || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <Link
                href={`/user/${report.reportedUser.username || report.reportedUser.id}`}
                className="text-base font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                target="_blank"
              >
                {report.reportedUser.name || report.reportedUser.username || report.reportedUser.email}
              </Link>
              {report.reportedUser.username && (
                <p className="text-sm text-gray-500">@{report.reportedUser.username}</p>
              )}
              <p className="text-xs text-gray-500">{report.reportedUser.email}</p>
            </div>
          </div>
          <Link
            href={`/user/${report.reportedUser.username || report.reportedUser.id}`}
            className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-700 hover:underline"
            target="_blank"
          >
            View profile →
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleAction("dismiss")}
          disabled={isPending}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => {
            if (report.product?.isHidden || report.comment?.isHidden) {
              // If already hidden, show message
              toast.error("Content is already hidden. Use 'Reviewed Reports' section to unhide it.")
              return
            }
            handleAction("hide")
          }}
          disabled={isPending || report.product?.isHidden || report.comment?.isHidden}
          className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {report.product?.isHidden || report.comment?.isHidden ? "Already Hidden" : "Hide Content"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to remove this content? This action can be reversed in the 'Reviewed Reports' section.")) {
              handleAction("remove")
            }
          }}
          disabled={isPending}
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remove Content
        </button>
      </div>
    </div>
  )
}
