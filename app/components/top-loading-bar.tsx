"use client"

export function TopLoadingBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-50"
      aria-hidden="true"
      role="status"
      aria-live="polite"
    >
      <div className="h-full bg-gray-900 animate-loading-progress" />
    </div>
  )
}
