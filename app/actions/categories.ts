"use server"

import { prisma } from "@/lib/prisma"

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  })
}

export async function ensureCategoriesExist() {
  const defaultCategories = [
    { name: "SaaS", slug: "saas", description: "Software as a Service" },
    { name: "Mobile App", slug: "mobile-app", description: "Mobile applications" },
    { name: "Developer Tools", slug: "developer-tools", description: "Tools for developers" },
    { name: "AI Tools", slug: "ai-tools", description: "Artificial Intelligence tools" },
    { name: "Design Tools", slug: "design-tools", description: "Design and creative tools" },
    { name: "Productivity", slug: "productivity", description: "Productivity and workflow tools" },
    { name: "Marketing", slug: "marketing", description: "Marketing and growth tools" },
    { name: "E-commerce", slug: "ecommerce", description: "E-commerce and retail" },
    { name: "Education", slug: "education", description: "Educational tools and platforms" },
    { name: "Entertainment", slug: "entertainment", description: "Entertainment and media" },
  ]

  // Quick check: if we have at least one category, assume they all exist
  const existingCount = await prisma.category.count()
  if (existingCount >= defaultCategories.length) {
    return // Categories already exist, skip expensive upserts
  }

  // Only run upserts if categories are missing
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
}
