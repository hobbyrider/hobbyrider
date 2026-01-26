import { getBlogPostBySlug, formatBlogDate } from "@/lib/payload"
import { LexicalContent } from "@/app/components/lexical-content"
import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageTitle, SectionTitle, Muted, Small, Text } from "@/app/components/typography"
import Link from "next/link"
import "../blog-editorial.css"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Revalidate every 60 seconds

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found | hobbyrider Blog",
    }
  }

  return {
    title: `${post.title} | hobbyrider Blog`,
    description: post.excerpt || post.meta?.description || `Read ${post.title} on hobbyrider`,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.meta?.description || "",
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: post.heroImage?.url
        ? [
            {
              url: post.heroImage.url,
              width: post.heroImage.width,
              height: post.heroImage.height,
              alt: post.heroImage.alt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.meta?.description || "",
      images: post.heroImage?.url ? [post.heroImage.url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="blog-editorial mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back to Blog */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08l-4.158 3.96H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-6 sm:mb-8">
        {/* Date and Author */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          {(post.publishedAt || post.createdAt) && (
            <Small className="text-gray-500">
              {formatBlogDate(post.publishedAt || post.createdAt)}
            </Small>
          )}
          {post.author?.name && (
            <>
              <span className="text-gray-300">•</span>
              <Small className="text-gray-500">By {post.author.name}</Small>
            </>
          )}
        </div>

        {/* Title */}
        <PageTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6">
          {post.title}
        </PageTitle>

        {/* Excerpt */}
        {post.excerpt && (
          <Muted className="text-lg sm:text-xl mb-6 sm:mb-8">
            {post.excerpt}
          </Muted>
        )}

        {/* Hero Image */}
        {post.heroImage?.url && (
          <div className="relative w-full h-64 sm:h-80 lg:h-96 mb-6 sm:mb-8 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={post.heroImage.url}
              alt={post.heroImage.alt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
              priority
            />
          </div>
        )}
      </header>

      {/* Article Content */}
      <article>
        {post.content ? (
          <LexicalContent content={post.content} />
        ) : (
          <Text className="text-gray-600 italic">
            Content not available
          </Text>
        )}
      </article>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08l-4.158 3.96H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </Link>
      </footer>
    </div>
  )
}
