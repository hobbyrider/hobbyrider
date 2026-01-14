"use server"

import { prisma } from "@/lib/prisma"

export async function searchSoftware(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = query.trim()

  const results = await prisma.software.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { tagline: { contains: searchTerm, mode: "insensitive" } },
        { maker: { contains: searchTerm, mode: "insensitive" } },
        { categories: { some: { name: { contains: searchTerm, mode: "insensitive" } } } },
      ],
    },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })

  return results.map((item) => ({
    ...item,
    commentCount: item._count.comments,
  }))
}
