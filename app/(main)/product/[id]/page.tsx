import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { createComment } from "@/app/actions/comments"
import { trackProductView } from "@/app/actions/analytics"
import { getRelativeTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { cache } from "react"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import { ProductGallery } from "@/app/components/product-gallery"
import { SidebarBlock } from "@/app/components/sidebar-block"
import { ReportButton } from "@/app/components/report-button"
import { getSession } from "@/lib/get-session"
import type { Metadata } from "next"
import { PageTitle, SectionTitle, Text, Muted, Small } from "@/app/components/typography"
import { ProductActions } from "./product-actions"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate product pages every 60 seconds

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

// Cached product query to prevent duplicate fetches in metadata and page
const getCachedProduct = cache(async (id: string) => {
  return await prisma.software.findUnique({
    where: { id },
    include: {
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
    },
  })
})

// Generate metadata for product pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getCachedProduct(id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/product/${id}`
  const description = product.description || product.tagline
  const image = product.thumbnail || `${baseUrl}/icon.svg`
  const categoryNames = product.categories.map((c) => c.name).join(", ")
  const makerName = product.makerUser?.name || product.makerUser?.username || product.maker || "Unknown"

  return {
    title: `${product.name} · hobbyrider`,
    description: description,
    openGraph: {
      title: product.name,
      description: description,
      url: productUrl,
      siteName: "hobbyrider",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description,
      images: [image],
    },
    alternates: {
      canonical: productUrl,
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
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:20',message:'ProductPage entry',data:{productId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  let session
  try {
    session = await getSession()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:25',message:'getSession result',data:{hasSession:!!session,userId:session?.user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:28',message:'getSession error',data:{error:err?.message||String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    session = null
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:32',message:'Before product query',data:{productId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  // Fetch product with full data and comments in parallel
  const [product, comments] = await Promise.all([
    prisma.software.findUnique({
      where: { id },
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
        productId: id,
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
  ])

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:65',message:'Product query result',data:{found:!!product,hasMakerId:!!product?.makerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!product) {
    notFound()
  }

  // Track product view asynchronously (don't block page render)
  trackProductView(id).catch((error) => {
    console.error("Failed to track product view:", error)
  })

  // Check if user has upvoted this product
  let hasUpvoted = false
  if (session?.user?.id) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:72',message:'Before upvote query',data:{userId:session.user.id,productId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const upvote = await prisma.upvote.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: id,
          },
        },
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:84',message:'Upvote query success',data:{found:!!upvote},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      hasUpvoted = !!upvote
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4547670b-f49c-49d0-8d5b-e313b24778f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/product/[id]/page.tsx:88',message:'Upvote query error',data:{error:err?.message||String(err),code:err?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      hasUpvoted = false
    }
  }

  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/product/${id}`
  
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
      <main className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-4 sm:mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          ← Back to home
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-10">
            {/* Product Header */}
            <div>
              <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-5">
                {product.thumbnail && (
                  <div className="h-16 w-16 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl border border-gray-200 overflow-hidden relative">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-cover"
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
                  
                  {product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
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
                <ReportButton type="product" contentId={product.id} contentName={product.name} />
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
              <div className="space-y-6 sm:space-y-10">
                {product.description && (
                  <section>
                    <SectionTitle className="mb-4 text-gray-900">Overview</SectionTitle>
                    <div className="prose prose-gray max-w-none">
                      <Text className="whitespace-pre-wrap text-gray-700">
                        {product.description}
                      </Text>
                    </div>
                  </section>
                )}

                {product.embedHtml && (
                  <section>
                    <SectionTitle className="mb-4 text-gray-900">Video</SectionTitle>
                    <div
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      // embedHtml is sanitized on save (server action)
                      dangerouslySetInnerHTML={{ __html: product.embedHtml }}
                    />
                  </section>
                )}
              </div>
            )}

            {/* Comments Section */}
            <section id="comments" className="border-t border-gray-200 pt-6 sm:pt-10">
              <SectionTitle className="mb-4 sm:mb-6 text-xl sm:text-2xl text-gray-900">
                Comments ({comments.length})
              </SectionTitle>

              <CommentForm productId={id} />

              <div className="mt-8 space-y-6">
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
                      productId={id}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6">
            <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              {/* Actions Section */}
              <SidebarBlock>
                <ProductActions
                  productId={product.id}
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

              {/* Builder Info */}
              {(product.makerUser || product.maker) && (
                <SidebarBlock title="Builder">
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
                            href={`/builder/${product.maker}`}
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
