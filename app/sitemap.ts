import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getProductUrl, generateSlug } from "@/lib/slug"
import { getBlogPosts } from "@/lib/payload"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://hobbyrider.io"
}

/**
 * Format date to YYYY-MM-DD (date-only format required by Google)
 */
function formatDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const today = formatDateOnly(new Date())

  // Static pages - Google-compliant: only url and lastModified (date-only)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: today,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: today,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: today,
    },
  ]

  // Dynamic product pages (using canonical URLs)
  try {
    const products = await prisma.software.findMany({
      where: {
        isHidden: false,
      },
      select: {
        id: true,
        slug: true,
        name: true, // Need name to generate slug if missing
        createdAt: true,
      },
      take: 10000, // Limit to prevent timeout
    })

    const productPages: MetadataRoute.Sitemap = products.map((product) => {
      // Use canonical URL format: /products/{slug}-{id}
      const canonicalSlug = product.slug || generateSlug(product.name)
      const canonicalUrl = getProductUrl(canonicalSlug, product.id)
      return {
        url: `${baseUrl}${canonicalUrl}`,
        lastModified: formatDateOnly(product.createdAt),
      }
    })

    // Blog posts from PayloadCMS
    let blogPages: MetadataRoute.Sitemap = []
    try {
      const response = await getBlogPosts({ limit: 1000 })
      blogPages = response.docs.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: formatDateOnly(post.updatedAt || post.createdAt || new Date()),
      }))
    } catch (error) {
      console.warn("Could not fetch blog posts for sitemap:", error)
    }

    // Category pages
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
      },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: today,
    }))

    return [...staticPages, ...productPages, ...categoryPages, ...blogPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return at least static pages if database query fails
    return staticPages
  }
}
