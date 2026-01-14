import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { createComment } from "@/app/actions/comments"
import { getRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { CommentForm } from "./comment-form"
import { UpvoteButton } from "@/app/components/upvote-button"
import { ProductGallery } from "@/app/components/product-gallery"

export const dynamic = "force-dynamic"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: {
        authorUser: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black mb-6 inline-block"
        >
          ← Back to home
        </Link>

        <article className="rounded-xl border p-8">
          <div className="flex gap-6">
            {product.thumbnail && (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="h-32 w-32 rounded-lg object-cover border flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="mt-2 text-lg text-gray-600">{product.tagline}</p>

              <div className="mt-4 flex items-center gap-4">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 transition"
                >
                  Visit website
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
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

                <UpvoteButton id={product.id} upvotes={product.upvotes} />
              </div>

              {product.categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {product.makerUser ? (
                    <div>
                      Submitted by{" "}
                      <Link
                        href={`/user/${product.makerUser.username || product.makerUser.id}`}
                        className="font-semibold text-black hover:underline"
                      >
                        @{product.makerUser.username || product.makerUser.name}
                      </Link>
                    </div>
                  ) : product.maker ? (
                    <div>
                      Submitted by{" "}
                      <Link
                        href={`/maker/${product.maker}`}
                        className="font-semibold text-black hover:underline"
                      >
                        @{product.maker}
                      </Link>
                    </div>
                  ) : null}
                  {(product.maker || product.makerUser) && <span>•</span>}
                  <span>{getRelativeTime(product.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshot Gallery */}
          {product.images && product.images.length > 0 && (
            <ProductGallery images={product.images} />
          )}
        </article>

        {/* Comments Section */}
        <section id="comments" className="mt-8">
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Comments ({comments.length})
            </h2>

            <CommentForm productId={id} />

            <div className="mt-6 space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {comment.authorUser ? (
                            <Link
                              href={`/user/${comment.authorUser.username || comment.authorUser.id}`}
                              className="font-semibold text-sm hover:underline"
                            >
                              @{comment.authorUser.username || comment.authorUser.name}
                            </Link>
                          ) : (
                            <Link
                              href={`/maker/${comment.author}`}
                              className="font-semibold text-sm hover:underline"
                            >
                              @{comment.author}
                            </Link>
                          )}
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
