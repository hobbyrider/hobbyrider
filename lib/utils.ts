import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge class names (shadcn/ui compatible)
 * Combines clsx and tailwind-merge for conditional classes and Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * and limiting length. React escapes HTML automatically, but this adds
 * an extra layer of protection and prevents extremely long inputs.
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return ""
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength)
  
  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
  
  return sanitized
}

/**
 * Very small sanitizer for embedded HTML snippets.
 * We only intend to support iframe-style embeds (e.g. Guideless, Loom, YouTube).
 *
 * NOTE: This is not a full HTML sanitizer. It removes obvious dangerous patterns
 * (scripts, event handlers, javascript: URLs). For a production-grade app,
 * use a vetted sanitizer library on the server.
 */
export function sanitizeEmbedHtml(input: string, maxLength: number = 10000): string {
  if (!input) return ""

  let html = input.trim().slice(0, maxLength)

  // Remove script tags entirely
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  // Remove inline event handlers like onclick="..."
  html = html.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")

  // Disallow javascript: URLs in any attribute value
  html = html.replace(/javascript:/gi, "")

  // Very basic allow-list intent: must include an iframe to be considered valid
  if (!/<iframe[\s>]/i.test(html)) {
    return ""
  }

  return html
}
