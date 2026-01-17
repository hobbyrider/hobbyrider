"use client"

import { useState } from "react"
import { reportContent, type ReportReason } from "@/app/actions/moderation"
import { useRouter } from "next/navigation"
import { ReportIcon } from "@/app/components/icons"

type ReportButtonProps = {
  type: "product" | "comment" | "user"
  contentId: string
  contentName?: string
  variant?: "default" | "inline"
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading information" },
  { value: "copyright", label: "Copyright violation" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
]

export function ReportButton({ type, contentId, contentName, variant = "default" }: ReportButtonProps) {
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

  const isInline = variant === "inline"

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isInline
            ? "inline-flex items-center p-1.5 rounded border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"
            : "flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-lg border-2 border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"
        } transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
        title="Report content"
        aria-label={`Report ${type}`}
      >
        <ReportIcon className={isInline ? "w-3.5 h-3.5" : "w-5 h-5"} />
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
          <div className={`absolute ${isInline ? 'left-0' : 'right-0'} top-full mt-2 z-50 w-[calc(100vw-4rem)] max-w-[280px] sm:max-w-[320px] rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-lg`}>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Report {type === "product" ? "Product" : type === "comment" ? "Comment" : "User"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Reason
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
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
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Additional details
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please provide more information..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm resize-none focus:border-gray-900 focus:outline-none"
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
                  className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedReason}
                  className="flex-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
