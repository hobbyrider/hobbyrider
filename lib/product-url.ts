/**
 * Product URL utilities
 * 
 * Centralized functions for generating product URLs throughout the application
 * Uses the canonical /products/{slug}-{id} format
 */

import { getProductUrl, getProductFullUrl } from "./slug"

/**
 * Get product URL path (relative)
 * 
 * @param product - Product object with slug and id
 * @returns Product URL path (e.g., "/products/guideless-cmklm8srz0000awjyd5mj8l38")
 */
export function getProductPath(product: { slug: string | null; id: string }): string {
  return getProductUrl(product.slug, product.id)
}

/**
 * Get full product URL (absolute)
 * 
 * @param product - Product object with slug and id
 * @param baseUrl - Base URL (optional, defaults to production)
 * @returns Full product URL
 */
export function getProductAbsoluteUrl(
  product: { slug: string | null; id: string },
  baseUrl?: string
): string {
  return getProductFullUrl(product.slug, product.id, baseUrl)
}

/**
 * Get product URL for href/link usage
 * Handles products that might not have slugs yet (generates on-the-fly)
 * 
 * @param product - Product object with slug (optional) and id
 * @returns Product URL path
 */
export function getProductLink(product: { slug?: string | null; id: string; name?: string }): string {
  // If slug exists, use it; otherwise generate from name
  const slug = product.slug || (product.name ? require("./slug").generateSlug(product.name) : "product")
  return getProductUrl(slug, product.id)
}
