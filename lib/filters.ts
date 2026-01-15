/**
 * Utility functions for filtering and sorting
 */

export type SortOption = "upvotes" | "newest" | "comments" | "trending"
export type DateFilter = "all" | "today" | "week" | "month"

export function buildQueryString(params: {
  category?: string
  sort?: SortOption
  date?: DateFilter
  page?: number
}): string {
  const searchParams = new URLSearchParams()
  
  if (params.category) {
    searchParams.set("category", params.category)
  }
  if (params.sort && params.sort !== "upvotes") {
    searchParams.set("sort", params.sort)
  }
  if (params.date && params.date !== "all") {
    searchParams.set("date", params.date)
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString())
  }
  
  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

export function getDateFilter(dateFilter: DateFilter): { gte?: Date } | undefined {
  if (dateFilter === "all") return undefined
  
  const now = new Date()
  let startDate: Date
  
  switch (dateFilter) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case "week":
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    default:
      return undefined
  }
  
  return { gte: startDate }
}

/**
 * Calculate trending score based on upvotes and recency
 * Formula: upvotes / (hours_since_creation + 2) ^ 1.5
 * This gives more weight to recent products with high upvotes
 */
export function calculateTrendingScore(upvotes: number, createdAt: Date): number {
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const denominator = Math.pow(hoursSinceCreation + 2, 1.5)
  return upvotes / denominator
}
