import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRelativeTime } from '@/lib/utils'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://hobbyrider.vercel.app'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = await configPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
    depth: 1,
  })

  const post = docs[0]
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const baseUrl = getBaseUrl()
  const postUrl = `${baseUrl}/blog/${slug}`
  const featuredImage = typeof post.featuredImage === 'object' 
    ? post.featuredImage?.url 
    : post.featuredImage
  const seoImage = typeof post.seoImage === 'object'
    ? post.seoImage?.url
    : post.seoImage || featuredImage

  return {
    title: `${post.seoTitle || post.title} · hobbyrider`,
    description: post.seoDescription || post.excerpt || post.title,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.title,
      url: postUrl,
      siteName: 'hobbyrider',
      images: seoImage ? [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : undefined,
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.title,
      images: seoImage ? [seoImage] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = await configPromise
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
    depth: 2,
  })

  const post = docs[0]
  if (!post) {
    notFound()
  }

  const featuredImage = typeof post.featuredImage === 'object' 
    ? post.featuredImage?.url 
    : post.featuredImage

  // Import RichText component for rendering
  const { RichText } = await import('@/app/components/rich-text')

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          ← Back to blog
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mb-4 text-xl text-gray-600">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {post.publishedAt && (
                <span>{getRelativeTime(new Date(post.publishedAt))}</span>
              )}
              {post.author && typeof post.author === 'object' && (
                <span>by {post.author.name || post.author.email}</span>
              )}
            </div>
          </header>

          {featuredImage && (
            <div className="mb-8">
              <img
                src={featuredImage}
                alt={post.title}
                className="w-full rounded-xl border border-gray-200 object-cover"
              />
            </div>
          )}

          {post.content && (
            <RichText data={post.content} />
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag: any, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {typeof tag === 'object' ? tag.tag : tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </main>
  )
}
