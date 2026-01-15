import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { createComment } from "@/app/actions/comments"
import { getRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import { UpvoteButton } from "@/app/components/upvote-button"
import { ProductGallery } from "@/app/components/product-gallery"
import { SidebarBlock } from "@/app/components/sidebar-block"
import { ReportButton } from "@/app/components/report-button"
import { getSession } from "@/lib/get-session"

export const dynamic = "force-dynamic"

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

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          ← Back to home
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-10">
            {/* Product Header */}
            <div>
              <div className="mb-6 flex items-start gap-5">
                {product.thumbnail && (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-24 w-24 flex-shrink-0 rounded-xl border border-gray-200 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="mb-2 text-4xl font-semibold leading-tight tracking-tight text-gray-900">
                    {product.name}
                  </h1>
                  <p className="mb-4 text-xl leading-relaxed text-gray-600">
                    {product.tagline}
                  </p>
                  
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

              <div className="flex items-center gap-3">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-900 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
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
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <ProductGallery images={product.images} />
              </div>
            )}

            {/* Description & Demo */}
            {(product.description || product.embedHtml) && (
              <div className="space-y-10">
                {product.description && (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">About</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                        {product.description}
                      </p>
                    </div>
                  </section>
                )}

                {product.embedHtml && (
                  <section>
                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">Demo</h2>
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
            <section id="comments" className="border-t border-gray-200 pt-10">
              <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                Discussion ({comments.length})
              </h2>

              <CommentForm productId={id} />

              <div className="mt-8 space-y-6">
                {comments.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                    <p className="text-gray-600">
                      No comments yet. Be the first to comment!
                    </p>
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
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Upvote Section */}
              <SidebarBlock>
                <div className="text-center">
                  <UpvoteButton 
                    id={product.id} 
                    upvotes={product.upvotes} 
                    hasUpvoted={hasUpvoted}
                    isLoggedIn={!!session?.user?.id}
                  />
                </div>
              </SidebarBlock>

              {/* Maker Info */}
              {(product.makerUser || product.maker) && (
                <SidebarBlock title="Maker">
                  <div className="flex items-center gap-3">
                    {product.makerUser ? (
                      <>
                        {product.makerUser.image ? (
                          <img
                            src={product.makerUser.image}
                            alt={product.makerUser.username || product.makerUser.name || "Maker"}
                            className="h-12 w-12 rounded-full object-cover border border-gray-200"
                          />
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
                            href={`/maker/${product.maker}`}
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
  )
}
