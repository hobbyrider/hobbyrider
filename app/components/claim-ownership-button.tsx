"use client"

import { useState, useTransition } from "react"
import { requestOwnership } from "@/app/actions/ownership"
import { useRouter, usePathname } from "next/navigation"
import toast from "react-hot-toast"

type ClaimOwnershipButtonProps = {
  productId: string
  productName: string
  isLoggedIn?: boolean
}

export function ClaimOwnershipButton({ productId, productName, isLoggedIn = false }: ClaimOwnershipButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    if (!isLoggedIn) {
      // Redirect to signup with callback URL
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || `/product/${productId}`)}`)
      return
    }
    // If logged in, open the modal
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("Please provide a reason (at least 10 characters)")
      return
    }

    startTransition(async () => {
      try {
        await requestOwnership(productId, reason)
        toast.success("Ownership claim submitted! We'll review it soon.")
        setIsOpen(false)
        setReason("")
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to submit ownership claim")
      }
    })
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-900 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        <span className="hidden sm:inline">Claim Product</span>
        <span className="sm:hidden">Claim</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Claim Ownership of {productName}
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Tell us why you should own this product page. We'll review your request and get back to you soon.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Why should you own this product?
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., I'm the founder of this product, I work on the team, etc."
                  required
                  minLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setReason("")
                  }}
                  disabled={isPending}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !reason.trim() || reason.trim().length < 10}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border-2 border-gray-900 bg-gray-900 text-white text-sm font-semibold transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
