import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getProductUrl, generateSlug } from "@/lib/slug"

export const dynamic = "force-dynamic"
export const revalidate = 60

/**
 * Legacy /product/[id] route - Redirects to canonical /products/[slug]-[id] format
 * This ensures all old links and indexed URLs still work with permanent redirects
 */
export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Fetch product to get slug (or generate if missing)
  const product = await prisma.software.findUnique({
    where: { id },
    select: { slug: true, name: true },
  })

  if (!product) {
    // Product doesn't exist - let Next.js handle 404
    redirect("/")
    return
  }

  // Generate canonical slug (generate if missing for existing products)
  const canonicalSlug = product.slug || generateSlug(product.name)
  const canonicalUrl = getProductUrl(canonicalSlug, id)

  // Redirect to canonical URL (Next.js redirect is permanent by default for same-domain)
  redirect(canonicalUrl)
}
