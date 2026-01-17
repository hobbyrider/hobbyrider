"use client"

import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useTransition } from "react"
import { buildQueryString, type SortOption, type DateFilter } from "@/lib/filters"
import { TopLoadingBar } from "@/app/components/top-loading-bar"

export function FilterControls() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  
  const category = searchParams.get("category") || undefined
  const currentSort = (searchParams.get("sort") || "upvotes") as SortOption
  const currentDate = (searchParams.get("date") || "all") as DateFilter

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "upvotes", label: "Top" },
    { value: "newest", label: "New" },
    { value: "comments", label: "Discussed" },
    { value: "trending", label: "Trending" },
  ]

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ]

  const hasActiveFilters = currentSort !== "upvotes" || currentDate !== "all"

  // Reset to page 1 when filters change
  const buildFilterUrl = (sort?: SortOption, date?: DateFilter) => {
    return buildQueryString({
      category,
      sort: sort || currentSort,
      date: date || currentDate,
      page: 1, // Always reset to page 1 when filters change
    })
  }

  const handleFilterClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <>
      <TopLoadingBar isLoading={isPending} />
      <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
      {/* Sort Options */}
      <div>
        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block" id="sort-label">
          Rank by
        </label>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap hide-scrollbar pb-1 sm:pb-0 -mx-1 sm:mx-0 px-1 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }} role="group" aria-labelledby="sort-label">
          {sortOptions.map((option) => {
            const isActive = currentSort === option.value
            const href = buildFilterUrl(option.value, currentDate)
            const filterKey = `sort-${option.value}`
            return (
              <Link
                key={option.value}
                href={href || "/"}
                onClick={(e) => handleFilterClick(href || "/", e)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
                aria-pressed={isActive}
              >
                {option.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Date Filter */}
      <div>
        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block" id="date-label">
          Time range
        </label>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap hide-scrollbar pb-1 sm:pb-0 -mx-1 sm:mx-0 px-1 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }} role="group" aria-labelledby="date-label">
          {dateOptions.map((option) => {
            const isActive = currentDate === option.value
            const href = buildFilterUrl(currentSort, option.value)
            const filterKey = `date-${option.value}`
            return (
              <Link
                key={option.value}
                href={href || "/"}
                onClick={(e) => handleFilterClick(href || "/", e)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900`}
                aria-pressed={isActive}
              >
                {option.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div>
          <Link
            href={category ? `/?category=${category}` : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            Clear filters
          </Link>
        </div>
      )}
      </div>
    </>
  )
}
