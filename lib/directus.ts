/**
 * Directus SDK Client
 * 
 * This file creates and exports a Directus client for fetching content.
 * 
 * Setup:
 * 1. Deploy Directus (see directus/README.md for options)
 * 2. Set DIRECTUS_URL in Vercel environment variables (e.g., https://your-directus-instance.com)
 * 3. Set DIRECTUS_TOKEN for authenticated requests (optional, or use public API)
 * 
 * Usage:
 * ```typescript
 * import { directus } from '@/lib/directus'
 * 
 * const posts = await directus.items('blog_posts').readByQuery({
 *   filter: { status: { _eq: 'published' } },
 *   sort: ['-published_at'],
 * })
 * ```
 */

import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'

// Directus URL - set in environment variables
const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL

if (!DIRECTUS_URL) {
  console.warn('⚠️ DIRECTUS_URL not set. Directus integration will not work.')
}

// Create Directus client
export const directusClient = DIRECTUS_URL
  ? createDirectus<DirectusSchema>(DIRECTUS_URL)
      .with(rest())
      .with(staticToken(process.env.DIRECTUS_TOKEN || ''))
  : null

// Type-safe schema for your Directus collections
type DirectusSchema = {
  blog_posts: BlogPost[]
  pages: Page[]
  directus_files: DirectusFile[]
}

// Type definitions (adjust based on your Directus collections)
type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: any // Rich text content
  featured_image?: string // Directus file ID
  author?: string // User ID
  published_at?: string
  status: 'draft' | 'published' | 'archived'
  tags?: string[]
  seo_title?: string
  seo_description?: string
  seo_image?: string
  date_created?: string
  date_updated?: string
}

type Page = {
  id: string
  title: string
  slug: string
  content: any
  template: 'default' | 'landing' | 'about'
  published: boolean
  seo_title?: string
  seo_description?: string
  date_created?: string
  date_updated?: string
}

type DirectusFile = {
  id: string
  filename_download: string
  title?: string
  type?: string
  filesize?: number
  width?: number
  height?: number
}

// Helper functions for common operations
export const directus = {
  // Get all blog posts
  async getBlogPosts(params?: {
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    sort?: string[]
  }) {
    if (!directusClient) {
      throw new Error('Directus client not configured. Set DIRECTUS_URL environment variable.')
    }

    const filter: any = {}
    if (params?.status) {
      filter.status = { _eq: params.status }
    }

    return await directusClient.request(
      readItems('blog_posts', {
        filter,
        limit: params?.limit || 100,
        sort: params?.sort || ['-published_at'],
      })
    )
  },

  // Get a single blog post by slug
  async getBlogPostBySlug(slug: string) {
    if (!directusClient) {
      throw new Error('Directus client not configured.')
    }

    const posts = await directusClient.request(
      readItems('blog_posts', {
        filter: { slug: { _eq: slug } },
        limit: 1,
      })
    )

    return posts[0] || null
  },

  // Get all pages
  async getPages(params?: { published?: boolean }) {
    if (!directusClient) {
      throw new Error('Directus client not configured.')
    }

    const filter: any = {}
    if (params?.published !== undefined) {
      filter.published = { _eq: params.published }
    }

    return await directusClient.request(
      readItems('pages', {
        filter,
      })
    )
  },

  // Get a single page by slug
  async getPageBySlug(slug: string) {
    if (!directusClient) {
      throw new Error('Directus client not configured.')
    }

    const pages = await directusClient.request(
      readItems('pages', {
        filter: { slug: { _eq: slug } },
        limit: 1,
      })
    )

    return pages[0] || null
  },

  // Get file URL
  getFileUrl(fileId?: string | null) {
    if (!fileId || !DIRECTUS_URL) return null
    return `${DIRECTUS_URL}/assets/${fileId}`
  },
}
