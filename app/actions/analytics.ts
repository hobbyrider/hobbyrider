"use server"

import { prisma } from "@/lib/prisma"

/**
 * Track a product view
 * Increments view count and updates last viewed timestamp
 */
export async function trackProductView(productId: string) {
  try {
    await prisma.software.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
        lastViewedAt: new Date(),
      },
    })
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.error("Failed to track product view:", error)
  }
}

/**
 * Get popular products based on views
 */
export async function getPopularProducts(limit = 10) {
  try {
    return await prisma.software.findMany({
      where: {
        isHidden: false,
      },
      orderBy: [
        { viewCount: "desc" },
        { upvotes: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        tagline: true,
        url: true,
        thumbnail: true,
        upvotes: true,
        viewCount: true,
        createdAt: true,
        makerUser: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Failed to get popular products:", error)
    return []
  }
}

/**
 * Get trending products (combination of views, upvotes, and recency)
 */
export async function getTrendingProducts(limit = 10) {
  try {
    const products = await prisma.software.findMany({
      where: {
        isHidden: false,
      },
      select: {
        id: true,
        name: true,
        tagline: true,
        url: true,
        thumbnail: true,
        upvotes: true,
        viewCount: true,
        createdAt: true,
        makerUser: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    // Calculate trending score: (views * 0.3) + (upvotes * 0.5) + (comments * 0.2)
    // Weighted by recency (products from last 7 days get 2x multiplier)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const productsWithScore = products.map((product) => {
      const isRecent = product.createdAt > sevenDaysAgo
      const recencyMultiplier = isRecent ? 2 : 1
      const score =
        (product.viewCount * 0.3 +
          product.upvotes * 0.5 +
          product._count.comments * 0.2) *
        recencyMultiplier

      return {
        ...product,
        trendingScore: score,
      }
    })

    // Sort by trending score and return top products
    return productsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)
      .map(({ trendingScore, ...product }) => product)
  } catch (error) {
    console.error("Failed to get trending products:", error)
    return []
  }
}

/**
 * Get analytics stats for a product
 */
export async function getProductAnalytics(productId: string) {
  try {
    const product = await prisma.software.findUnique({
      where: { id: productId },
      select: {
        viewCount: true,
        upvotes: true,
        lastViewedAt: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    if (!product) {
      return null
    }

    return {
      views: product.viewCount,
      upvotes: product.upvotes,
      comments: product._count.comments,
      lastViewedAt: product.lastViewedAt,
      engagementRate:
        product.viewCount > 0
          ? ((product.upvotes + product._count.comments) / product.viewCount) * 100
          : 0,
    }
  } catch (error) {
    console.error("Failed to get product analytics:", error)
    return null
  }
}

/**
 * Get overall platform analytics
 */
export async function getPlatformAnalytics() {
  try {
    const [
      totalProducts,
      totalViews,
      totalUpvotes,
      totalComments,
      totalUsers,
      popularProducts,
    ] = await Promise.all([
      prisma.software.count({
        where: { isHidden: false },
      }),
      prisma.software.aggregate({
        where: { isHidden: false },
        _sum: { viewCount: true },
      }),
      prisma.software.aggregate({
        where: { isHidden: false },
        _sum: { upvotes: true },
      }),
      prisma.comment.count({
        where: { isHidden: false },
      }),
      prisma.user.count(),
      getPopularProducts(5),
    ])

    return {
      totalProducts,
      totalViews: totalViews._sum.viewCount || 0,
      totalUpvotes: totalUpvotes._sum.upvotes || 0,
      totalComments,
      totalUsers,
      averageViewsPerProduct:
        totalProducts > 0
          ? Math.round((totalViews._sum.viewCount || 0) / totalProducts)
          : 0,
      averageUpvotesPerProduct:
        totalProducts > 0
          ? Math.round((totalUpvotes._sum.upvotes || 0) / totalProducts)
          : 0,
      popularProducts,
    }
  } catch (error) {
    console.error("Failed to get platform analytics:", error)
    return null
  }
}
