export const dynamic = "force-dynamic"

import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getAllCategories, ensureCategoriesExist } from "@/app/actions/categories"
import { getRelativeTime } from "@/lib/utils"
import { UpvoteButton } from "@/app/components/upvote-button"
import { UserMenu } from "@/app/components/user-menu"

type SoftwareItem = {
  id: string
  name: string
  tagline: string
  url: string
  maker: string | null
  thumbnail: string | null
  upvotes: number
  commentCount: number
  categories: { id: string; name: string; slug: string }[]
  createdAt: Date
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams

  // Ensure categories exist (idempotent)
  await ensureCategoriesExist()

  const [softwareToday, categories] = await Promise.all([
    prisma.software.findMany({
      where: categorySlug
        ? {
            categories: {
              some: {
                slug: categorySlug,
              },
            },
          }
        : undefined,
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        name: true,
        tagline: true,
        url: true,
        maker: true,
        thumbnail: true,
        upvotes: true,
        createdAt: true,
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
    }),
    getAllCategories(),
  ])

  const softwareWithCounts: SoftwareItem[] = softwareToday.map((item) => ({
    ...item,
    commentCount: item._count.comments,
  }))

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold">hobbyrider</h1>
          <p className="mt-3 text-gray-600">
            Discover and share software worth riding 🤖
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-3">
              <Link
                href="/submit"
                className="inline-block rounded-lg border px-4 py-2 font-semibold hover:bg-black hover:text-white transition"
              >
                Submit software
              </Link>
              <Link
                href="/search"
                className="inline-block rounded-lg border px-4 py-2 font-semibold hover:bg-gray-100 transition"
              >
                Search
              </Link>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={`px-3 py-1 rounded-full text-sm border transition ${
                !categorySlug
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  categorySlug === category.slug
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name || "Products"
              : "Today"}
          </h2>

          {softwareWithCounts.length === 0 ? (
            <p className="mt-4 text-gray-600">
              No submissions yet. Be the first!
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {softwareWithCounts.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover border flex-shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/product/${item.id}`}
                            className="font-semibold underline underline-offset-4 hover:text-gray-600"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      <p className="mt-1 text-gray-600">{item.tagline}</p>
                      {item.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/?category=${category.slug}`}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {item.maker && (
                        <p className="mt-1 text-xs text-gray-500">
                          Submitted by{" "}
                          <Link
                            href={`/maker/${item.maker}`}
                            className="font-semibold hover:underline"
                          >
                            @{item.maker}
                          </Link>
                        </p>
                      )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/product/${item.id}#comments`}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.188 1.705.338 2.57.45v3.025a.75.75 0 001.163.638l3.086-2.126a26.75 26.75 0 001.88-.128c2.14-.344 4.334-.524 6.57-.524h.25a.75.75 0 00.75-.75v-5.148c0-1.413-.993-2.67-2.43-2.902A41.403 41.403 0 0010 2zm8.75 10.5h-.25a25.25 25.25 0 00-6.57.524c-1.437.232-2.43 1.49-2.43 2.902v.25a.75.75 0 00.75.75h.25a25.25 25.25 0 006.57-.524c1.437-.232 2.43-1.49 2.43-2.902v-.25a.75.75 0 00-.75-.75zM8.75 6.75a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item.commentCount}</span>
                      </Link>
                      <UpvoteButton id={item.id} upvotes={item.upvotes} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}