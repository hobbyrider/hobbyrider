/**
 * React cache() utility for deduplicating database queries
 * 
 * This prevents duplicate queries when the same data is requested
 * multiple times in the same render pass.
 */

import { cache } from "react"

/**
 * Cache a database query function
 * 
 * Usage:
 * const getCachedProduct = cache(async (id: string) => {
 *   return await prisma.software.findUnique({ where: { id } })
 * })
 */
export { cache }

/**
 * Helper to create cached query functions
 */
export function createCachedQuery<T extends (...args: any[]) => Promise<any>>(
  queryFn: T
): T {
  return cache(queryFn) as T
}
