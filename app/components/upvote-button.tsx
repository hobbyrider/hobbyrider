"use client"

import { useTransition, useState } from "react"
import { upvoteSoftware } from "@/app/actions/software"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { UpvoteIcon } from "@/app/components/icons"
import toast from "react-hot-toast"
import { trackProductUpvote } from "@/lib/posthog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UpvoteButtonProps = {
  id: string
  upvotes: number
  hasUpvoted?: boolean
  isLoggedIn?: boolean
  variant?: "default" | "compact"
}

export function UpvoteButton({ id, upvotes, hasUpvoted = false, isLoggedIn = false, variant = "default" }: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleUpvote = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await upvoteSoftware(id)
        trackProductUpvote(id, `Product ${id}`)
        router.refresh()
      } catch (err: any) {
        const errorMessage = err.message || "Failed to upvote"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  const isDisabled = isPending || !isLoggedIn
  const ariaLabel = !isLoggedIn
    ? "Login to upvote"
    : hasUpvoted
      ? `Remove upvote (currently ${upvotes} upvotes)`
      : `Upvote (currently ${upvotes} upvotes)`
  
  // Compact variant for feed cards
  if (variant === "compact") {
    return (
      <Button
        type="button"
        onClick={handleUpvote}
        disabled={isDisabled}
        variant="ghost"
        size="upvoteCompact"
        className={cn(
          "flex items-center gap-1.5",
          hasUpvoted && "text-green-600 hover:text-green-700",
          !hasUpvoted && "text-muted-foreground hover:text-foreground"
        )}
        title={hasUpvoted ? "Downvote" : "Upvote"}
        aria-label={ariaLabel}
      >
        <UpvoteIcon filled={hasUpvoted} />
        <span className="text-sm font-medium">{upvotes}</span>
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        type="button"
        onClick={handleUpvote}
        disabled={isDisabled}
        variant={hasUpvoted ? "upvoted" : "upvote"}
        size="upvote"
        className="flex flex-col items-center justify-center gap-1"
        aria-label={ariaLabel}
        title={!isLoggedIn ? "Login to upvote" : hasUpvoted ? "Click to remove your upvote" : "Click to upvote"}
      >
        {hasUpvoted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-green-600"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-muted-foreground"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="text-xl font-semibold leading-none">{upvotes}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {isPending ? "..." : hasUpvoted ? "Upvoted" : "Upvote"}
        </span>
      </Button>
      {error && (
        <p className="text-xs text-destructive text-center" role="alert">{error}</p>
      )}
      {!isLoggedIn && (
        <p className="text-xs text-muted-foreground text-center">
          <Link 
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} 
            className="underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded"
          >
            Login
          </Link> to upvote
        </p>
      )}
    </div>
  )
}
