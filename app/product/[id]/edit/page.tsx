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
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // Check if user is the creator
  if (product.makerId !== session.user.id) {
    redirect(`/product/${id}`)
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
