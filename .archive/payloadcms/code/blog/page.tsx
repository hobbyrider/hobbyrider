import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import Link from 'next/link'
import { getRelativeTime } from '@/lib/utils'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Blog · hobbyrider',
  description: 'Read the latest articles and updates from hobbyrider',
}

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://hobbyrider.vercel.app'
}

export default async function BlogPage() {
  const config = await configPromise
  const payload = await getPayload({ config })

  // Fetch published blog posts
  const { docs: posts } = await payload.find({
    collection: 'blog-posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 20,
    depth: 1,
  })

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <h1 className="mb-2 text-4xl font-semibold tracking-tight text-gray-900">
            Blog
          </h1>
          <p className="text-lg text-gray-600">
            Latest articles and updates from hobbyrider
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-base text-gray-600">
              No blog posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post: any) => {
              const featuredImage = typeof post.featuredImage === 'object' 
                ? post.featuredImage?.url 
                : post.featuredImage
              
              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex gap-6">
                      {featuredImage && (
                        <img
                          src={featuredImage}
                          alt={post.title}
                          className="h-32 w-32 flex-shrink-0 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="mb-2 text-2xl font-semibold text-gray-900 hover:text-gray-700">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mb-3 text-gray-600 line-clamp-2">
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
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
