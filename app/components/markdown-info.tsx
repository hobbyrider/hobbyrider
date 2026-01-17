"use client"

import { useState } from "react"

export function MarkdownInfo() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        aria-label="Markdown formatting help"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-[calc(100vw-2rem)] max-w-xs sm:max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <h4 className="mb-2 text-sm font-semibold text-gray-900">Markdown Formatting</h4>
          <div className="space-y-2 text-xs text-gray-700">
            <div>
              <strong>Bold:</strong> <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">**text**</code>
            </div>
            <div>
              <strong>Italic:</strong> <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">*text*</code>
            </div>
            <div>
              <strong>Heading:</strong> <code className="px-1 py-0.5 bg-gray-100 rounded text-xs"># Heading</code>
            </div>
            <div>
              <strong>Bullet points:</strong> Start lines with <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">- </code> or <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">* </code>
            </div>
            <div>
              <strong>Numbered list:</strong> Start lines with <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">1. </code>
            </div>
            <div>
              <strong>Line break:</strong> Use two spaces at end of line or empty line
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
