"use client"

import { useState } from "react"
import { reportContent, type ReportReason } from "@/app/actions/moderation"
import { useRouter } from "next/navigation"
import { ReportIcon } from "@/app/components/icons"

type ReportButtonProps = {
  type: "product" | "comment" | "user"
  contentId: string
  contentName?: string
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading information" },
  { value: "copyright", label: "Copyright violation" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
]

export function ReportButton({ type, contentId, contentName }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) return

    setError(null)
    setSubmitting(true)

    try {
      await reportContent(type, contentId, selectedReason as ReportReason, details || undefined)
      setSuccess(true)
      setIsOpen(false)
      setTimeout(() => {
        setSuccess(false)
        setSelectedReason("")
        setDetails("")
      }, 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-sm text-green-600 font-medium">
        Report submitted. Thank you!
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-lg border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:bg-gray-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        title="Report content"
        aria-label={`Report ${type}`}
      >
        <ReportIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setError(null)
            }}
          />

          {/* Modal */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Report {type === "product" ? "Product" : type === "comment" ? "Comment" : "User"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Reason
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                  required
                >
                  <option value="">Select a reason</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason === "other" && (
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    Additional details
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please provide more information..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-gray-900 focus:outline-none"
                    maxLength={500}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setError(null)
                    setSelectedReason("")
                    setDetails("")
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedReason}
                  className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
