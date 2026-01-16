import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.vercel.app"
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Blog route disabled (depends on PayloadCMS - see docs/archive/payloadcms/)
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: new Date(),
    //   changeFrequency: "daily",
    //   priority: 0.7,
    // },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Dynamic product pages
  try {
    const products = await prisma.software.findMany({
      where: {
        isHidden: false,
      },
      select: {
        id: true,
        createdAt: true,
      },
      take: 10000, // Limit to prevent timeout
    })

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    // Blog posts from PayloadCMS (currently disabled - see docs/archive/payloadcms/)
    // When PayloadCMS is re-enabled, uncomment this section
    const blogPages: MetadataRoute.Sitemap = []
    // try {
    //   const { getPayload } = await import('payload')
    //   const configPromise = await import('@/payload.config')
    //   const payload = await getPayload({ config: await configPromise.default })
    //   
    //   const { docs: blogPosts } = await payload.find({
    //     collection: 'blog-posts',
    //     where: {
    //       status: {
    //         equals: 'published',
    //       },
    //     },
    //     select: {
    //       slug: true,
    //       updatedAt: true,
    //     },
    //     limit: 1000,
    //   })
    //
    //   blogPages = blogPosts.map((post: any) => ({
    //     url: `${baseUrl}/blog/${post.slug}`,
    //     lastModified: post.updatedAt || new Date(),
    //     changeFrequency: "monthly",
    //     priority: 0.6,
    //   }))
    // } catch (error) {
    //   console.warn('Could not fetch blog posts for sitemap:', error)
    // }

    // Category pages
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
      },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }))

    return [...staticPages, ...productPages, ...categoryPages, ...blogPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return at least static pages if database query fails
    return staticPages
  }
}
