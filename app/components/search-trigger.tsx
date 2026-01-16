"use client"

import { useEffect, useState } from "react"
import { SearchModal } from "@/app/components/search-modal"

export function SearchTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Guard against undefined/null key or non-string values
      // Some keyboard events (like IME composition) may not have a key property
      if (!e.key || typeof e.key !== 'string') {
        return
      }
      
      try {
        const isK = e.key.toLowerCase() === "k"
        const isMeta = e.metaKey || e.ctrlKey
        if (isMeta && isK) {
          e.preventDefault()
          setOpen(true)
        }
      } catch (error) {
        // Silently ignore errors from keyboard events
        // This can happen with special keyboard events or IME composition
        return
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 flex-shrink-0 text-gray-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 104.473 8.708l2.41 2.409a.75.75 0 101.06-1.06l-2.409-2.41A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 117.999.001A4 4 0 015 9z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-base text-gray-400">Search products...</span>
      </button>

      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

