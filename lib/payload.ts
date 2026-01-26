/**
 * Payload CMS API utility
 * Fetches blog posts from payload.hobbyrider.io
 */

const PAYLOAD_API_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || "https://payload.hobbyrider.io"

export interface PayloadBlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: any // Lexical rich text format
  publishedAt?: string
  createdAt?: string
  updatedAt: string
  _status?: "draft" | "published"
  author?: {
    id: string
    name?: string
    email?: string
  }
  meta?: {
    title?: string
    description?: string
    image?: string
  }
  heroImage?: {
    id: string
    url: string
    alt?: string
    width?: number
    height?: number
  }
}

export interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page?: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number
  nextPage?: number
}

/**
 * Fetch all published blog posts
 */
export async function getBlogPosts(options?: {
  limit?: number
  page?: number
  sort?: string
}): Promise<PayloadResponse<PayloadBlogPost>> {
  const limit = options?.limit || 10
  const page = options?.page || 1
  const sort = options?.sort || "-publishedAt"

  try {
    // Try different endpoint formats
    const endpoints = [
      `${PAYLOAD_API_URL}/api/posts`,
      `${PAYLOAD_API_URL}/api/blog-posts`,
    ]
    
    let lastError: Error | null = null
    
    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint)
        url.searchParams.set("limit", limit.toString())
        url.searchParams.set("page", page.toString())
        url.searchParams.set("sort", sort)
        // Only fetch published posts - try different query formats
        url.searchParams.set("where[_status][equals]", "published")

        const fetchUrl = url.toString()
        console.log(`Attempting to fetch from: ${fetchUrl}`)
        
        const response = await fetch(fetchUrl, {
          next: { revalidate: 60 }, // Revalidate every 60 seconds
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // If we get here, this endpoint worked
        const data = await response.json()
        console.log(`Successfully fetched ${data.docs?.length || 0} posts from ${endpoint}`)
        
        // Convert relative image URLs to absolute URLs
        if (data.docs && Array.isArray(data.docs)) {
          data.docs = data.docs.map((post: PayloadBlogPost) => {
            if (post.heroImage?.url && !post.heroImage.url.startsWith("http")) {
              post.heroImage.url = `${PAYLOAD_API_URL}${post.heroImage.url}`
            }
            return post
          })
        }
        
        return data
      } catch (error) {
        lastError = error as Error
        // Try next endpoint
        continue
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error("Failed to fetch from any endpoint")

  } catch (error) {
    console.error("Error fetching blog posts:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        endpoint: PAYLOAD_API_URL,
      })
    }
    // Return empty response on error
    return {
      docs: [],
      totalDocs: 0,
      limit,
      totalPages: 0,
      page,
      pagingCounter: 0,
      hasPrevPage: false,
      hasNextPage: false,
    }
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<PayloadBlogPost | null> {
  try {
    // Try different endpoint formats
    const endpoints = [
      `${PAYLOAD_API_URL}/api/posts`,
      `${PAYLOAD_API_URL}/api/blog-posts`,
    ]
    
    let lastError: Error | null = null
    
    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint)
        url.searchParams.set("where[slug][equals]", slug)
        url.searchParams.set("where[_status][equals]", "published")
        url.searchParams.set("limit", "1")

        const fetchUrl = url.toString()
        console.log(`Attempting to fetch post by slug from: ${fetchUrl}`)
        
        const response = await fetch(fetchUrl, {
          next: { revalidate: 60 }, // Revalidate every 60 seconds
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // If we get here, this endpoint worked
        const data: PayloadResponse<PayloadBlogPost> = await response.json()
        console.log(`Successfully fetched post from ${endpoint}`)
        const post = data.docs.length > 0 ? data.docs[0] : null
        
        // Convert relative image URLs to absolute URLs
        if (post?.heroImage?.url && !post.heroImage.url.startsWith("http")) {
          post.heroImage.url = `${PAYLOAD_API_URL}${post.heroImage.url}`
        }
        
        return post
      } catch (error) {
        lastError = error as Error
        console.warn(`Failed to fetch from ${endpoint}:`, error instanceof Error ? error.message : error)
        // Try next endpoint
        continue
      }
    }
    
    // If all endpoints failed, throw the last error
    const finalError = lastError || new Error("Failed to fetch from any endpoint")
    console.error("All Payload API endpoints failed:", {
      endpoints: endpoints,
      lastError: finalError.message,
      slug,
      hint: "Make sure CORS is configured in Payload CMS. See docs/setup/PAYLOAD_CORS_SETUP.md"
    })
    throw finalError

  } catch (error) {
    console.error("Error fetching blog post:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        endpoint: PAYLOAD_API_URL,
        slug,
      })
    }
    return null
  }
}

/**
 * Convert Payload date string to readable format
 */
export function formatBlogDate(dateString?: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}
