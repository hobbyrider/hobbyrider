// API route to fetch blog posts from Directus
// GET /api/blog

import { directus } from '@/lib/directus'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'draft' | 'published' | 'archived' | undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const sort = searchParams.get('sort')?.split(',') || ['-published_at']

    const posts = await directus.getBlogPosts({
      status,
      limit,
      sort,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
