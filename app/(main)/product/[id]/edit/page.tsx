import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getAllCategories } from "@/app/actions/categories"
import EditProductForm from "./edit-form"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const product = await prisma.software.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true, // Include slug for canonical URLs
      tagline: true,
      description: true,
      url: true,
      thumbnail: true,
      embedHtml: true,
      makerId: true,
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          url: true,
          order: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  // Check if user is the creator or an admin
  if (product.makerId !== session.user.id && !user?.isAdmin) {
    // Redirect to canonical URL
    const { getProductUrl, generateSlug } = await import("@/lib/slug")
    const canonicalSlug = product.slug || generateSlug(product.name)
    redirect(getProductUrl(canonicalSlug, id))
  }

  const categories = await getAllCategories()

  return (
    <EditProductForm
      product={product}
      categories={categories}
      existingImages={product.images.map((img) => ({ id: img.id, url: img.url }))}
    />
  )
}
