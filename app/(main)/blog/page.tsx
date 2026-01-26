import { getBlogPosts, formatBlogDate } from "@/lib/payload"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import "./blog-editorial.css"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Blog | hobbyrider",
  description: "Read the latest articles and insights from hobbyrider",
  openGraph: {
    title: "Blog | hobbyrider",
    description: "Read the latest articles and insights from hobbyrider",
    type: "website",
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1", 10))
  const postsPerPage = 12

  const response = await getBlogPosts({
    limit: postsPerPage,
    page: currentPage,
    sort: "-publishedAt",
  })

  const { docs: posts, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage } = response

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6 py-12 sm:py-16">
      {/* Medium-style single column editorial feed */}
      <div className="max-w-[680px] mx-auto">
        {/* Header - Minimal, typographic */}
        <div className="mb-12 sm:mb-16">
          <h1 className="blog-display mb-4">Blog</h1>
          <p className="blog-body-small">
            Insights, updates, and stories from the hobbyrider community
          </p>
        </div>

        {/* Blog Posts - Medium horizontal card layout */}
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="blog-body-small">No blog posts available yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <ul className="space-y-0">
              {posts.map((post, index) => (
                <li key={post.id}>
                  <article className="blog-article-card">
                    {/* Hero Image - Medium 3:2 aspect, 120x80 on desktop */}
                    {post.heroImage?.url && (
                      <div className="blog-article-card-image">
                        <Link href={`/blog/${post.slug}`}>
                          <Image
                            src={post.heroImage.url}
                            alt={post.heroImage.alt || post.title}
                            width={120}
                            height={80}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 768px) 100vw, 120px"
                            loading="lazy"
                          />
                        </Link>
                      </div>
                    )}

                    {/* Content - Medium typography */}
                    <div className="blog-article-card-content">
                      {/* Meta - Date and Author */}
                      {(post.publishedAt || post.createdAt || post.author?.name) && (
                        <div className="blog-article-card-meta mb-2">
                          {post.author?.name && (
                            <span>{post.author.name}</span>
                          )}
                          {post.author?.name && (post.publishedAt || post.createdAt) && (
                            <span className="mx-2">·</span>
                          )}
                          {(post.publishedAt || post.createdAt) && (
                            <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                          )}
                        </div>
                      )}

                      {/* Title - Medium serif, hover underline */}
                      <Link href={`/blog/${post.slug}`} className="blog-article-card-title block">
                        {post.title}
                      </Link>

                      {/* Excerpt - Medium sans, secondary color */}
                      {post.excerpt && (
                        <p className="blog-article-card-excerpt line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            {/* Pagination - Medium button style */}
            {(hasNextPage || hasPrevPage) && (
              <nav
                className="flex items-center justify-center gap-4 mt-12 pt-8 blog-divider"
                aria-label="Blog pagination"
              >
                {hasPrevPage && prevPage && (
                  <Link
                    href={`/blog${prevPage > 1 ? `?page=${prevPage}` : ""}`}
                    className="blog-button-secondary"
                  >
                    Previous
                  </Link>
                )}
                <span className="blog-meta px-4">
                  Page {currentPage} of {totalPages}
                </span>
                {hasNextPage && nextPage && (
                  <Link
                    href={`/blog?page=${nextPage}`}
                    className="blog-button-secondary"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
