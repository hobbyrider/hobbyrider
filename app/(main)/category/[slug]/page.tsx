import { getCategoryBySlug } from "@/app/actions/categories"
import { notFound } from "next/navigation"
import Link from "next/link"
import { FeedItemCard } from "@/app/components/feed-item-card"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Revalidate category pages every 5 minutes

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  const baseUrl = getBaseUrl()
  const categoryUrl = `${baseUrl}/category/${slug}`

  return {
    title: `${category.name} · hobbyrider`,
    description: `Discover ${category.name} products on hobbyrider. Find the best ${category.name.toLowerCase()} tools and software.`,
    openGraph: {
      title: `${category.name} Products · hobbyrider`,
      description: `Discover ${category.name} products on hobbyrider`,
      url: categoryUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.name} · hobbyrider`,
      description: `Discover ${category.name} products`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Fetch upvote status for all products if user is logged in
  const upvotedProductIds = new Set<string>()
  if (session?.user?.id && category.products.length > 0) {
    const upvotes = await prisma.upvote.findMany({
      where: {
        userId: session.user.id,
        productId: { in: category.products.map((p) => p.id) },
      },
      select: { productId: true },
    })
    upvotes.forEach((u) => upvotedProductIds.add(u.productId))
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href="/"
          className="mb-4 sm:mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          ← Back to home
        </Link>

        <header className="mb-8 sm:mb-10">
          <h1 className="mb-2 text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {category.name}
          </h1>
          {category.description && (
            <p className="mb-4 text-base sm:text-lg leading-relaxed text-gray-600">
              {category.description}
            </p>
          )}
          <p className="text-sm text-gray-600">
            {category.products.length}{" "}
            {category.products.length === 1 ? "product" : "products"}
          </p>
        </header>

        <section>
          {category.products.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-base text-gray-600">
                No products in this category yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {category.products.map((product) => (
                <FeedItemCard
                  key={product.id}
                  item={{
                    id: product.id,
                    name: product.name,
                    tagline: product.tagline,
                    url: product.url,
                    maker: product.maker,
                    thumbnail: product.thumbnail,
                    upvotes: product.upvotes,
                    viewCount: product.viewCount || 0,
                    commentCount: product._count.comments,
                    categories: [],
                    createdAt: product.createdAt,
                  }}
                  hasUpvoted={upvotedProductIds.has(product.id)}
                  isLoggedIn={!!session?.user?.id}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
