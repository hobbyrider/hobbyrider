"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { UpvoteIcon, CommentIcon, CopyIcon, ReportIcon } from "@/app/components/icons"
import { upvoteSoftware } from "@/app/actions/software"
import { ReportButton } from "@/app/components/report-button"
import toast from "react-hot-toast"
import { getProductFullUrl } from "@/lib/slug"

type ProductActionsProps = {
  productId: string
  productName: string
  productSlug?: string | null // Optional slug - will be generated if missing
  upvotes: number
  hasUpvoted: boolean
  isLoggedIn: boolean
  commentCount: number
}

export function ProductActions({
  productId,
  productName,
  productSlug,
  upvotes,
  hasUpvoted,
  isLoggedIn,
  commentCount,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>("")

  // Get canonical URL (client-side, uses current window origin)
  useEffect(() => {
    const url = getProductFullUrl(productSlug || null, productId, window.location.origin)
    setShareUrl(url)
  }, [productId, productSlug])

  const handleUpvote = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    setIsUpvoting(true)
    try {
      await upvoteSoftware(productId)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to upvote")
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleCopyUrl = async () => {
    const url = shareUrl || `${window.location.origin}/products/product-${productId}` // Fallback
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL copied!")
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        toast.success("URL copied!")
      } catch (fallbackErr) {
        toast.error("Failed to copy URL")
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Upvote button */}
      <button
        type="button"
        onClick={handleUpvote}
        disabled={isUpvoting}
        className={`flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          hasUpvoted
            ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400"
            : "bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
        } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
        aria-label={hasUpvoted ? "Remove upvote" : "Upvote"}
        title={hasUpvoted ? "Remove upvote" : "Upvote"}
      >
        <UpvoteIcon filled={hasUpvoted} className="w-5 h-5" />
        <span className="text-xs font-semibold leading-none">{upvotes}</span>
      </button>

      {/* Comment button */}
      <a
        href="#comments"
        onClick={(e) => {
          e.preventDefault()
          const commentsSection = document.getElementById("comments")
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }}
        className="flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-lg border-2 border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        title="View comments"
        aria-label={`${commentCount} comments`}
      >
        <CommentIcon className="w-5 h-5" />
        <span className="text-xs font-semibold leading-none">{commentCount}</span>
      </a>

      {/* Copy URL button */}
      <button
        type="button"
        onClick={handleCopyUrl}
        className="flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-lg border-2 border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        aria-label="Copy URL"
        title="Copy URL"
      >
        <CopyIcon className="w-5 h-5" />
      </button>

      {/* Report button */}
      <ReportButton type="product" contentId={productId} contentName={productName} />
    </div>
  )
}
