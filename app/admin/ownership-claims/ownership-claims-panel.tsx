"use client"

import { useState, useTransition } from "react"
import { reviewOwnershipClaim } from "@/app/actions/ownership"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { getRelativeTime } from "@/lib/utils"

type OwnershipClaim = {
  id: string
  reason: string
  status: string
  createdAt: Date
  product: {
    id: string
    name: string
    url: string
    thumbnail: string | null
    ownershipStatus: string
  }
  claimant: {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
  }
}

type OwnershipClaimsPanelProps = {
  initialClaims: OwnershipClaim[]
}

export function OwnershipClaimsPanel({ initialClaims }: OwnershipClaimsPanelProps) {
  const [claims, setClaims] = useState(initialClaims)
  const [isPending, startTransition] = useTransition()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const router = useRouter()

  const handleReview = async (claimId: string, action: "approve" | "reject") => {
    setReviewingId(claimId)
    
    startTransition(async () => {
      try {
        await reviewOwnershipClaim(claimId, action, adminNotes || undefined)
        toast.success(`Claim ${action === "approve" ? "approved" : "rejected"}`)
        setClaims(claims.filter((c) => c.id !== claimId))
        setAdminNotes("")
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to review claim")
      } finally {
        setReviewingId(null)
      }
    })
  }

  if (claims.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
        <p className="text-sm text-gray-600">No pending ownership claims</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div
          key={claim.id}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                {claim.product.thumbnail && (
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 relative">
                    <Image
                      src={claim.product.thumbnail}
                      alt={claim.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${claim.product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors block truncate"
                  >
                    {claim.product.name}
                  </Link>
                  <a
                    href={claim.product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors block truncate"
                  >
                    {claim.product.url}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">
                    {getRelativeTime(claim.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Claimant Info */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2">
                {claim.claimant.image ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 relative">
                    <Image
                      src={claim.claimant.image}
                      alt={claim.claimant.name || claim.claimant.username || "Claimant"}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 border border-gray-300">
                    {(claim.claimant.name || claim.claimant.username || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="text-right">
                  <Link
                    href={`/user/${claim.claimant.username || claim.claimant.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors block"
                  >
                    {claim.claimant.name || claim.claimant.username || "Unknown"}
                  </Link>
                  <p className="text-xs text-gray-500">{claim.claimant.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{claim.reason}</p>
          </div>

          {/* Admin Notes */}
          <div className="mt-4">
            <label htmlFor={`notes-${claim.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (optional)
            </label>
            <textarea
              id={`notes-${claim.id}`}
              value={reviewingId === claim.id ? adminNotes : ""}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Add notes about this claim..."
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => handleReview(claim.id, "reject")}
              disabled={isPending && reviewingId === claim.id}
              className="px-4 py-2 rounded-lg border-2 border-red-300 bg-white text-red-700 text-sm font-semibold transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && reviewingId === claim.id ? "Rejecting..." : "Reject"}
            </button>
            <button
              onClick={() => handleReview(claim.id, "approve")}
              disabled={isPending && reviewingId === claim.id}
              className="px-4 py-2 rounded-lg border-2 border-green-600 bg-green-600 text-white text-sm font-semibold transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && reviewingId === claim.id ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
