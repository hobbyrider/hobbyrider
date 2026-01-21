import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { createComment } from "@/app/actions/comments"
import { getRelativeTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { cache } from "react"
import { CommentForm } from "../../product/[id]/comment-form"
import { CommentItem } from "../../product/[id]/comment-item"
import { ProductGallery } from "@/app/components/product-gallery"
import { SidebarBlock } from "@/app/components/sidebar-block"
import { ReportButton } from "@/app/components/report-button"
import { getSession } from "@/lib/get-session"
import type { Metadata } from "next"
import { PageTitle, SectionTitle, Text, Muted, Small } from "@/app/components/typography"
import { ProductActions } from "../../product/[id]/product-actions"
import { MarkdownContent } from "@/app/components/markdown-content"
import { LaunchTeam } from "@/app/components/launch-team"
import { ClaimOwnershipButton } from "@/app/components/claim-ownership-button"
import { InfoTooltip } from "@/app/components/info-tooltip"
import { getLaunchTeam } from "@/app/actions/launch-team"
import { getProductOwnershipClaim } from "@/app/actions/ownership"
import { extractIdFromSlugId, getProductUrl, getProductFullUrl, isCanonicalSlugId, generateSlug } from "@/lib/slug"
import { getProductOGImage, buildOpenGraphMetadata, buildTwitterMetadata, truncateText } from "@/lib/metadata"
import { ProductViewTracker } from "@/app/components/product-view-tracker"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate product pages every 60 seconds

// Helper function to get base URL
function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.io"
}

// Cached product query to prevent duplicate fetches in metadata and page
const getCachedProduct = cache(async (id: string) => {
  return await prisma.software.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true, // Include slug for canonical URLs
      tagline: true,
      description: true,
      thumbnail: true,
      images: {
        select: {
          url: true,
        },
        take: 1, // Only need first image for OG
      },
      categories: {
        select: {
          name: true,
        },
      },
      makerUser: {
        select: {
          name: true,
          username: true,
        },
      },
      maker: true,
    },
  })
})

// Generate metadata for product pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugId: string }>
}): Promise<Metadata> {
  const { slugId } = await params
  const productId = extractIdFromSlugId(slugId)
  
  if (!productId) {
    return {
      title: "Product Not Found",
    }
  }

  const product = await getCachedProduct(productId)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const baseUrl = getBaseUrl()
  
  // Generate canonical slug if missing (for existing products without slugs)
  const canonicalSlug = product.slug || generateSlug(product.name)
  const canonicalProductUrl = getProductFullUrl(canonicalSlug, product.id, baseUrl)
  const canonicalSlugId = `${canonicalSlug}-${product.id}`
  
  // If slug doesn't match, canonical will be the correct one (redirect handled in page)
  const productUrl = isCanonicalSlugId(slugId, canonicalSlug, product.id)
    ? canonicalProductUrl
    : canonicalProductUrl // Always use canonical for metadata

  const description = product.description || product.tagline
  const truncatedDesc = truncateText(description, 160)
  const ogImage = getProductOGImage(product.thumbnail, (product.images && product.images.length > 0 ? product.images : null))
  const categoryNames = product.categories.map((c) => c.name).join(", ")
  const makerName = product.makerUser?.name || product.makerUser?.username || product.maker || "Unknown"

  return {
    title: `${product.name} · hobbyrider`,
    description: truncatedDesc,
    openGraph: {
      ...buildOpenGraphMetadata({
        title: product.name,
        description: truncatedDesc,
        url: productUrl,
        image: ogImage,
        type: "website",
      }),
    },
    twitter: buildTwitterMetadata({
      title: product.name,
      description: truncatedDesc,
      image: ogImage,
    }),
    alternates: {
      canonical: productUrl, // Always use canonical URL
    },
    other: {
      "product:price:amount": "0",
      "product:price:currency": "USD",
      "product:availability": "in stock",
      "product:category": categoryNames,
      "product:brand": makerName,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slugId: string }>
}) {
  const { slugId } = await params
  
  // Extract product ID from slug+id format
  const productId = extractIdFromSlugId(slugId)
  
  if (!productId) {
    notFound()
  }
  
  // Get session (non-blocking - page works without session)
  const session = await getSession().catch(() => null)
  
  // Fetch product with full data, comments, launch team, and ownership claim in parallel
  const [product, comments, launchTeam, userClaim] = await Promise.all([
    prisma.software.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        makerUser: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: { 
        productId: productId,
        isHidden: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    getLaunchTeam(productId).catch(() => []),
    session?.user?.id ? getProductOwnershipClaim(productId).catch(() => null) : Promise.resolve(null),
  ])

  if (!product) {
    notFound()
  }

  // Generate canonical slug (generate if missing for existing products)
  const canonicalSlug = product.slug || generateSlug(product.name)
  const canonicalSlugId = `${canonicalSlug}-${product.id}`

  // If slug in URL doesn't match canonical slug, redirect to canonical URL
  if (!isCanonicalSlugId(slugId, canonicalSlug, product.id)) {
    const canonicalUrl = getProductUrl(canonicalSlug, product.id)
    redirect(canonicalUrl) // Next.js redirect is permanent by default for same-domain
  }

  // If product doesn't have a slug yet (existing products), backfill it
  if (!product.slug && canonicalSlug) {
    // Backfill slug asynchronously (don't block page render)
    prisma.software.update({
      where: { id: product.id },
      data: { slug: canonicalSlug },
    }).catch((error) => {
      console.error("Failed to backfill slug:", error)
    })
  }

  // Check if user has upvoted this product
  let hasUpvoted = false
  if (session?.user?.id) {
    const upvote = await prisma.upvote.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    }).catch(() => null)
    hasUpvoted = !!upvote
  }

  const baseUrl = getBaseUrl()
  const productUrl = getProductFullUrl(canonicalSlug, product.id, baseUrl)
  
  // Structured data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description || product.tagline,
    url: product.url,
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: product.upvotes > 0 ? {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: product.upvotes.toString(),
    } : undefined,
    author: product.makerUser ? {
      "@type": "Person",
      name: product.makerUser.name || product.makerUser.username || "Unknown",
    } : undefined,
    image: product.thumbnail || undefined,
    datePublished: product.createdAt.toISOString(),
    category: product.categories.map((c) => c.name).join(", "),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductViewTracker productId={product.id} productName={product.name} />
      <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 min-w-0">
        <Link
          href="/"
          className="mb-4 sm:mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          ← Back to home
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-[1fr_320px] min-w-0">
          {/* Main Content */}
          <div className="space-y-6 min-w-0">
            {/* Product Header */}
            <div>
              <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-5">
                {product.thumbnail && (
                  <div className="h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl overflow-hidden relative bg-white">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-contain p-2 sm:p-3"
                      sizes="(max-width: 640px) 64px, 96px"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <PageTitle className="mb-2 text-2xl sm:text-4xl text-gray-900">
                    {product.name}
                  </PageTitle>
                  <Muted className="mb-4 text-base sm:text-xl">
                    {product.tagline}
                  </Muted>
                  
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {product.categories.length > 0 && (
                      <>
                        {product.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 sm:px-5 py-2.5 text-sm sm:text-base font-semibold text-gray-900 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  Visit Website
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Media Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
                <ProductGallery images={product.images} />
              </div>
            )}

            {/* Description & Video */}
            {(product.description || product.embedHtml) && (
              <div className="space-y-6">
                {product.description && (
                  <section>
                    <SectionTitle className="mb-4 text-gray-900">Overview</SectionTitle>
                    <MarkdownContent content={product.description} />
                  </section>
                )}

                {product.embedHtml && (
                  <section>
                    <SectionTitle className="mb-4 text-gray-900">Video</SectionTitle>
                    <div
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      dangerouslySetInnerHTML={{ __html: product.embedHtml }}
                    />
                  </section>
                )}
              </div>
            )}

            {/* Mobile: Actions, Stats, Builder - shown before comments on mobile only */}
            <div className="lg:hidden space-y-4 sm:space-y-6">
              {/* Actions Section */}
              <SidebarBlock>
                <ProductActions
                  productId={product.id}
                  productName={product.name}
                  productSlug={canonicalSlug}
                  upvotes={product.upvotes}
                  hasUpvoted={hasUpvoted}
                  isLoggedIn={!!session?.user?.id}
                  commentCount={comments.length}
                />
              </SidebarBlock>

              {/* Stats Section */}
              <SidebarBlock title="Stats">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Views</Small>
                    <span className="font-semibold text-gray-900">{product.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Upvotes</Small>
                    <span className="font-semibold text-gray-900">{product.upvotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Comments</Small>
                    <span className="font-semibold text-gray-900">{comments.length}</span>
                  </div>
                </div>
              </SidebarBlock>

              {/* Owner Info */}
              {(product.makerUser || product.maker) && (
                <SidebarBlock title={(product.ownershipStatus === "seeded" || product.seededBy) ? "Published by" : "Built by"}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {product.makerUser ? (
                        <>
                          {product.makerUser.image ? (
                            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 relative">
                              <Image
                                src={product.makerUser.image}
                                alt={product.makerUser.username || product.makerUser.name || "Builder"}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700 border border-gray-300">
                              {(product.makerUser.username || product.makerUser.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/user/${product.makerUser.username || product.makerUser.id}`}
                              className="block font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                            >
                              {product.makerUser.username || product.makerUser.name}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(product.createdAt)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700 border border-gray-300">
                            {product.maker?.[0].toUpperCase() || "?"}
                          </div>
                          <div>
                            <Link
                              href={`/user/${product.maker}`}
                              className="block font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                            >
                              @{product.maker}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(product.createdAt)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {(product.ownershipStatus === "seeded" || (product.ownershipStatus === "owned" && product.seededBy)) && (
                      <div className="pt-3 border-t border-gray-200">
                        {userClaim ? (
                          <div className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800 w-full justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            Claim Pending Review
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <ClaimOwnershipButton 
                                productId={product.id} 
                                productName={product.name}
                                isLoggedIn={!!session?.user?.id}
                              />
                              <InfoTooltip
                                content="Request ownership of this product page. Tell us why you should own it and we'll review your request."
                                ariaLabel="What is claiming?"
                                className="mt-0.5"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SidebarBlock>
              )}
            </div>

            {/* Comments Section */}
            <section id="comments" className="border-t border-gray-200 pt-6 sm:pt-10 min-w-0">
              <SectionTitle className="mb-4 sm:mb-6 text-xl sm:text-2xl text-gray-900">
                Comments ({comments.length})
              </SectionTitle>

              <CommentForm productId={productId} />

              <div className="mt-8 space-y-6 min-w-0">
                {comments.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 sm:py-12 text-center">
                    <Text className="text-sm sm:text-base text-gray-600">
                      No comments yet. Be the first to comment!
                    </Text>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      productId={productId}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block space-y-4 sm:space-y-6">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* Actions Section */}
              <SidebarBlock>
                <ProductActions
                  productId={product.id}
                  productName={product.name}
                  productSlug={canonicalSlug}
                  upvotes={product.upvotes}
                  hasUpvoted={hasUpvoted}
                  isLoggedIn={!!session?.user?.id}
                  commentCount={comments.length}
                />
              </SidebarBlock>

              {/* Stats Section */}
              <SidebarBlock title="Stats">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Views</Small>
                    <span className="font-semibold text-gray-900">{product.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Upvotes</Small>
                    <span className="font-semibold text-gray-900">{product.upvotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Small className="text-gray-600">Comments</Small>
                    <span className="font-semibold text-gray-900">{comments.length}</span>
                  </div>
                </div>
              </SidebarBlock>

              {/* Owner Info */}
              {(product.makerUser || product.maker) && (
                <SidebarBlock title={(product.ownershipStatus === "seeded" || product.seededBy) ? "Published by" : "Built by"}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {product.makerUser ? (
                        <>
                          {product.makerUser.image ? (
                            <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 relative">
                              <Image
                                src={product.makerUser.image}
                                alt={product.makerUser.username || product.makerUser.name || "Owner"}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700 border border-gray-300">
                              {(product.makerUser.username || product.makerUser.name || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/user/${product.makerUser.username || product.makerUser.id}`}
                              className="block font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                            >
                              {product.makerUser.username || product.makerUser.name}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(product.createdAt)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700 border border-gray-300">
                            {product.maker?.[0].toUpperCase() || "?"}
                          </div>
                          <div>
                            <Link
                              href={`/user/${product.maker}`}
                              className="block font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
                            >
                              @{product.maker}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(product.createdAt)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {(product.ownershipStatus === "seeded" || (product.ownershipStatus === "owned" && product.seededBy)) && (
                      <div className="pt-3 border-t border-gray-200">
                        {userClaim ? (
                          <div className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800 w-full justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            Claim Pending Review
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <ClaimOwnershipButton 
                                productId={product.id} 
                                productName={product.name}
                                isLoggedIn={!!session?.user?.id}
                              />
                              <InfoTooltip
                                content="Request ownership of this product page. Tell us why you should own it and we'll review your request."
                                ariaLabel="What is claiming?"
                                className="mt-0.5"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SidebarBlock>
              )}

              {/* Launch Team */}
              {launchTeam && launchTeam.length > 0 && (
                <SidebarBlock>
                  <LaunchTeam
                    members={launchTeam}
                    isOwner={session?.user?.id === product.makerId}
                    productId={product.id}
                  />
                </SidebarBlock>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
    </>
  )
}
