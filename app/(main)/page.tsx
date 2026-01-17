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
import { ensureCategoriesExist } from "@/app/actions/categories"
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

  // Fetch all products with optimized select (we'll sort in memory for trending)
  // Using select instead of include reduces data transfer and improves performance
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
    // Add take limit to prevent loading too many products at once
    take: 1000, // Reasonable limit for homepage
  })

  // Map to include comment counts
  let softwareWithCounts: SoftwareItem[] = allProducts.map((item: any) => ({
    ...item,
    commentCount: item._count.comments,
  }))

  // Apply sorting
  switch (sortOption) {
    case "newest":
      softwareWithCounts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case "comments":
      softwareWithCounts.sort((a, b) => b.commentCount - a.commentCount)
      break
    case "trending":
      softwareWithCounts.sort((a, b) => {
        const scoreA = calculateTrendingScore(a.upvotes, a.createdAt)
        const scoreB = calculateTrendingScore(b.upvotes, b.createdAt)
        return scoreB - scoreA
      })
      break
    case "upvotes":
    default:
      softwareWithCounts.sort((a, b) => {
        if (b.upvotes !== a.upvotes) {
          return b.upvotes - a.upvotes
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      break
  }

  // Calculate pagination
  const totalItems = softwareWithCounts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  // Apply pagination
  const paginatedProducts = softwareWithCounts.slice(startIndex, endIndex)

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
            {categorySlug 
              ? `Top in ${categorySlug.replace(/-/g, " ")}` 
              : "Discover software worth riding"}
          </PageTitle>
          <Muted className="mt-2 text-sm sm:text-base">
            Curated, community-ranked collections for builders.
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
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
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
