"use client"

import { useState } from "react"

type InfoTooltipProps = {
  content: string
  ariaLabel?: string
  className?: string
}

/**
 * InfoTooltip - Shows information on click (mobile) or hover (desktop)
 * Prevents overflow by positioning tooltip dynamically
 */
export function InfoTooltip({ content, ariaLabel = "Information", className = "" }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`group relative flex-shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 rounded"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {/* Tooltip - visible on hover (desktop) or click (mobile) */}
      {/* On mobile: show when isOpen is true */}
      {/* On desktop (sm:): show on group-hover, ignore isOpen state */}
      {/* Position: right-aligned to prevent overflow on right edge, with viewport-aware width */}
      <div 
        className={`
          absolute right-0 bottom-full mb-2 w-56 sm:w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg 
          transition-all duration-200 z-50
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          sm:opacity-0 sm:invisible sm:group-hover:opacity-100 sm:group-hover:visible
          max-w-[calc(100vw-1rem)]
          sm:max-w-[min(16rem,calc(100vw-2rem))]
        `}
        role="tooltip"
      >
        <p className="break-words">{content}</p>
        <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
      {/* Close overlay on mobile when tooltip is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
