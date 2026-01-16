/**
 * Rate Limiting Utility
 * 
 * Implements rate limiting using database queries to track user actions.
 * This works across serverless instances on Vercel.
 */

import { prisma } from "@/lib/prisma"

export type RateLimitConfig = {
  maxRequests: number
  windowMs: number // Time window in milliseconds
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: Date
  error?: string
}

/**
 * Check if a user action is within rate limits
 * Uses database queries to count recent actions within the time window
 */
export async function checkRateLimit(
  userId: string,
  actionType: "submission" | "comment" | "upvote",
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)

  let count = 0

  try {
    switch (actionType) {
      case "submission":
        // Count product submissions in the time window
        count = await prisma.software.count({
          where: {
            makerId: userId,
            createdAt: {
              gte: windowStart,
            },
          },
        })
        break

      case "comment":
        // Count comments in the time window
        count = await prisma.comment.count({
          where: {
            authorId: userId,
            createdAt: {
              gte: windowStart,
            },
          },
        })
        break

      case "upvote":
        // Count upvotes in the time window
        count = await prisma.upvote.count({
          where: {
            userId: userId,
            createdAt: {
              gte: windowStart,
            },
          },
        })
        break
    }

    const remaining = Math.max(0, config.maxRequests - count)
    const allowed = count < config.maxRequests

    // Calculate reset time (when the oldest action in the window expires)
    const resetAt = new Date(now.getTime() + config.windowMs)

    return {
      allowed,
      remaining,
      resetAt,
      error: allowed
        ? undefined
        : getRateLimitErrorMessage(actionType, config, resetAt),
    }
  } catch (error) {
    // On error, allow the action (fail open) but log the error
    console.error(`Rate limit check failed for ${actionType}:`, error)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now.getTime() + config.windowMs),
    }
  }
}

/**
 * Get user-friendly error message for rate limit exceeded
 */
function getRateLimitErrorMessage(
  actionType: "submission" | "comment" | "upvote",
  config: RateLimitConfig,
  resetAt: Date
): string {
  const windowHours = Math.floor(config.windowMs / (1000 * 60 * 60))
  const windowDays = Math.floor(config.windowMs / (1000 * 60 * 60 * 24))
  const resetIn = Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60))

  let actionName = ""
  let limitDescription = ""

  switch (actionType) {
    case "submission":
      actionName = "product submissions"
      if (windowDays >= 1) {
        limitDescription = `${config.maxRequests} per day`
      } else {
        limitDescription = `${config.maxRequests} per ${windowHours} hour${windowHours !== 1 ? "s" : ""}`
      }
      break
    case "comment":
      actionName = "comments"
      limitDescription = `${config.maxRequests} per ${windowHours} hour${windowHours !== 1 ? "s" : ""}`
      break
    case "upvote":
      actionName = "upvotes"
      limitDescription = `${config.maxRequests} per ${windowHours} hour${windowHours !== 1 ? "s" : ""}`
      break
  }

  return `Rate limit exceeded. You can make ${limitDescription} ${actionName}. Please try again in ${resetIn} minute${resetIn !== 1 ? "s" : ""}.`
}

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  submission: {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  comment: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  upvote: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const
