"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addProductImages(productId: string, imageUrls: string[]) {
  if (imageUrls.length === 0) return

  // Get current max order
  const maxOrder = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const startOrder = (maxOrder?.order ?? -1) + 1

  await prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      url,
      productId,
      order: startOrder + index,
    })),
  })

  revalidatePath(`/product/${productId}`)
}

export async function deleteProductImage(imageId: string, productId: string) {
  await prisma.productImage.delete({
    where: { id: imageId },
  })

  revalidatePath(`/product/${productId}`)
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
) {
  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  revalidatePath(`/product/${productId}`)
}
