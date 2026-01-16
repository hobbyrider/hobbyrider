import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PageTitle, Muted, CardTitle, Small } from "@/app/components/typography"

export const dynamic = "force-dynamic"
export const revalidate = 600 // Revalidate categories list every 10 minutes

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { products: true } },
    },
  })

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-4 sm:mb-6 inline-block text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          ← Back to home
        </Link>

        <header className="mb-8 sm:mb-10">
          <PageTitle className="mb-2 text-2xl sm:text-4xl text-gray-900">
            Product Categories
          </PageTitle>
          <Muted className="text-base sm:text-lg">
            Browse products by category.
          </Muted>
        </header>

        <ul className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id} className="group rounded-xl border border-gray-200 bg-white p-4 sm:p-5 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">
              <Link href={`/?category=${c.slug}`} className="block">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <CardTitle className="text-gray-900 group-hover:text-gray-700">
                        {c.name}
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {c.description && (
                      <Small className="text-gray-600 line-clamp-2">
                        {c.description}
                      </Small>
                    )}
                  </div>
                  <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-900">
                    {c._count.products}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

