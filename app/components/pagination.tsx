"use client"

import Link from "next/link"
import { buildQueryString, type SortOption, type DateFilter } from "@/lib/filters"

type PaginationProps = {
  currentPage: number
  totalPages: number
  category?: string
  sort: SortOption
  date: DateFilter
}

export function Pagination({
  currentPage,
  totalPages,
  category,
  sort,
  date,
}: PaginationProps) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range: (number | string)[] = []
    const rangeWithDots: (number | string)[] = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  const getPageUrl = (page: number) => {
    const query = buildQueryString({
      category,
      sort,
      date,
    })
    const separator = query ? "&" : "?"
    return `${query || "/"}${separator}page=${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 sm:h-4 sm:w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 sm:h-4 sm:w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-sm text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`inline-flex items-center justify-center min-w-[2rem] sm:min-w-[2.5rem] px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 sm:h-4 sm:w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-400 cursor-not-allowed">
          <span className="hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 sm:h-4 sm:w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Page Info */}
      <div className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
        Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
        <span className="font-medium text-gray-900">{totalPages}</span>
      </div>
    </nav>
  )
}
