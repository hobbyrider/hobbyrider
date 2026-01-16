export const dynamic = "force-dynamic"

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

export type SoftwareItem = {
  id: string
  name: string
  tagline: string
  url: string
  maker: string | null
  thumbnail: string | null
  upvotes: number
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

  // Fetch all products (we'll sort in memory for trending)
  const allProducts = await prisma.software.findMany({
    where: {
      ...(Object.keys(whereClause).length > 0 ? whereClause : {}),
      isHidden: false,
    },
    // Note: Cast to `any` to avoid occasional stale Prisma type issues in tooling.
    // Runtime schema includes these fields (see prisma/schema.prisma).
    select: {
      id: true,
      name: true,
      tagline: true,
      url: true,
      maker: true,
      thumbnail: true,
      upvotes: true,
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
    } as any,
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
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {categorySlug 
              ? `Top in ${categorySlug.replace(/-/g, " ")}` 
              : "Today's launches"}
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Discover and share software worth riding.
          </p>
        </header>

        {/* Filter Controls */}
        <FilterControls />

        {/* Feed Section */}
        <section>
          {paginatedProducts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-base text-gray-600">
                {totalItems === 0
                  ? "No submissions yet. Be the first!"
                  : "No products on this page."}
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
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
                <div className="mt-8">
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
