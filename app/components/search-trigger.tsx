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
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-gray-600"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 104.473 8.708l2.41 2.409a.75.75 0 101.06-1.06l-2.409-2.41A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 117.999.001A4 4 0 015 9z"
            clipRule="evenodd"
          />
        </svg>
        Search
      </button>

      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

