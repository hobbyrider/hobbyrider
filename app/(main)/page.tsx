export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate homepage every 60 seconds

import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover and share software worth riding",
  description: "hobbyrider - A community-driven platform to discover, share, and upvote the best software products. Find tools that are worth riding.",
  openGraph: {
    title: "hobbyrider - Discover and share software worth riding",
    description: "A community-driven platform to discover, share, and upvote the best software products.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "hobbyrider",
    description: "Discover and share software worth riding",
  },
}
import { ensureCategoriesExist, getCategoryBySlug } from "@/app/actions/categories"
import { getDateFilter, calculateTrendingScore, type SortOption, type DateFilter } from "@/lib/filters"
import { Pagination } from "@/app/components/pagination"
import { FilterControls } from "@/app/components/filter-controls"
import { FeedItemCard } from "@/app/components/feed-item-card"
import { getSession } from "@/lib/get-session"
import { PageTitle, Muted, Text } from "@/app/components/typography"

export type SoftwareItem = {
  id: string
  name: string
  tagline: string
  url: string
  maker: string | null
  thumbnail: string | null
  upvotes: number
  viewCount: number
  commentCount: number
  categories: { id: string; name: string; slug: string }[]
  createdAt: Date
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; date?: string; page?: string }>
}) {
  const { category: categorySlug, sort = "upvotes", date = "all", page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1", 10))
  const itemsPerPage = 20
  const session = await getSession()

  // Ensure categories exist (idempotent)
  await ensureCategoriesExist()

  // Fetch category name if filtering by category
  let categoryName: string | null = null
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug)
    categoryName = category?.name || null
  }

  // Parse and validate sort and date filters
  const sortOption = (sort === "newest" || sort === "comments" || sort === "trending") ? sort : "upvotes"
  const dateFilter = (date === "today" || date === "week" || date === "month") ? date : "all"

  // Build where clause
  const dateFilterClause = getDateFilter(dateFilter as DateFilter)
  const whereClause = {
    ...(categorySlug
      ? {
          categories: {
            some: {
              slug: categorySlug,
            },
          },
        }
      : {}),
    ...(dateFilterClause ? { createdAt: dateFilterClause } : {}),
  }

  // Optimize query based on sort option
  // For trending and comments, we need all products to calculate scores/sort by count
  // For upvotes and newest, we can use database ordering with pagination
  const requiresInMemorySort = sortOption === "trending" || sortOption === "comments"
  const skip = requiresInMemorySort ? 0 : (currentPage - 1) * itemsPerPage
  const take = requiresInMemorySort ? 500 : itemsPerPage // For in-memory sorts, fetch batch then paginate; for others, fetch only page

  // Build orderBy clause for database-side sorting (optimization)
  let orderBy: any[] = []
  if (!requiresInMemorySort) {
    switch (sortOption) {
      case "newest":
        orderBy = [{ createdAt: "desc" }]
        break
      case "upvotes":
      default:
        orderBy = [{ upvotes: "desc" }, { createdAt: "desc" }]
        break
    }
  } else {
    // For trending and comments, order by recency first as fallback
    orderBy = [{ createdAt: "desc" }]
  }

  // Fetch products with optimized query
  const allProducts = await prisma.software.findMany({
    where: {
      ...(Object.keys(whereClause).length > 0 ? whereClause : {}),
      isHidden: false,
    },
    select: {
      id: true,
      name: true,
      tagline: true,
      url: true,
      maker: true,
      makerUser: {
        select: {
          username: true,
          id: true,
        },
      },
      thumbnail: true,
      upvotes: true,
      viewCount: true,
      createdAt: true,
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy,
    skip: requiresInMemorySort ? undefined : skip,
    take: requiresInMemorySort ? take : take,
  })

  // Map to include comment counts and prefer makerUser over maker field
  let softwareWithCounts: SoftwareItem[] = allProducts.map((item: any) => ({
    ...item,
    commentCount: item._count.comments,
    // Prefer makerUser.username over maker field (maker field can be stale)
    maker: item.makerUser?.username || item.maker,
  }))

  // Apply in-memory sorting for comments and trending (database doesn't support _count sorting)
  if (sortOption === "comments") {
    softwareWithCounts.sort((a, b) => b.commentCount - a.commentCount)
  } else if (sortOption === "trending") {
    softwareWithCounts.sort((a, b) => {
      const scoreA = calculateTrendingScore(a.upvotes, a.createdAt)
      const scoreB = calculateTrendingScore(b.upvotes, b.createdAt)
      return scoreB - scoreA
    })
  }

  // For in-memory sorts (trending, comments), paginate after sorting
  // For database sorts (upvotes, newest), we already have the correct page
  let totalItems: number
  let paginatedProducts: SoftwareItem[]
  
  if (requiresInMemorySort) {
    // For trending/comments, we've fetched and sorted products, now paginate
    totalItems = softwareWithCounts.length
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    paginatedProducts = softwareWithCounts.slice(startIndex, endIndex)
  } else {
    // For upvotes/newest, we need total count for pagination
    totalItems = await prisma.software.count({
      where: {
        ...(Object.keys(whereClause).length > 0 ? whereClause : {}),
        isHidden: false,
      },
    })
    paginatedProducts = softwareWithCounts // Already paginated by database
  }

  // Fetch upvote status for all paginated products if user is logged in
  const upvotedProductIds = new Set<string>()
  if (session?.user?.id) {
    const upvotes = (await (prisma as any).upvote.findMany({
      where: {
        userId: session.user.id,
        productId: { in: paginatedProducts.map((p) => p.id) },
      },
      select: { productId: true },
    })) as Array<{ productId: string }>
    upvotes.forEach((u: { productId: string }) => upvotedProductIds.add(u.productId))
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Page Header */}
        <header className="mb-6 text-center sm:text-left sm:mb-8">
          <PageTitle className="text-2xl sm:text-3xl lg:text-4xl text-gray-900">
            {categoryName 
              ? `Top in ${categoryName}` 
              : "Discover software worth riding"}
          </PageTitle>
          <Muted className="mt-2 text-sm sm:text-base">
            Curated, community-ranked products directory. Built for builders, by builders.
          </Muted>
        </header>

        {/* Filter Controls */}
        <FilterControls />

        {/* Feed Section */}
        <section className="space-y-6">
          {paginatedProducts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 sm:p-12 text-center">
              <Text className="text-base text-gray-600">
                {totalItems === 0
                  ? "No submissions yet. Be the first!"
                  : "No products on this page."}
              </Text>
            </div>
          ) : (
            <>
              <ul className="space-y-4 sm:space-y-3">
                {paginatedProducts.map((item) => (
                  <FeedItemCard
                    key={item.id}
                    item={item}
                    hasUpvoted={upvotedProductIds.has(item.id)}
                    isLoggedIn={!!session?.user?.id}
                  />
                ))}
              </ul>
              
              {/* Pagination */}
              {Math.ceil(totalItems / itemsPerPage) > 1 && (
                <div className="mt-6 sm:mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    category={categorySlug}
                    sort={sortOption}
                    date={dateFilter as DateFilter}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
