import { getCategoryBySlug } from "@/app/actions/categories"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getRelativeTime } from "@/lib/utils"
import { UpvoteButton } from "@/app/components/upvote-button"

export const dynamic = "force-dynamic"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black mb-6 inline-block"
        >
          ← Back to home
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            {category.products.length}{" "}
            {category.products.length === 1 ? "product" : "products"}
          </p>
        </header>

        <section>
          {category.products.length === 0 ? (
            <p className="text-gray-600">No products in this category yet.</p>
          ) : (
            <ul className="space-y-3">
              {category.products.map((product) => (
                <li
                  key={product.id}
                  className="rounded-xl border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover border flex-shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/product/${product.id}`}
                            className="font-semibold underline underline-offset-4 inline-flex items-center gap-1 hover:text-gray-600"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(product.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{product.tagline}</p>
                        {product.maker && (
                          <p className="mt-1 text-xs text-gray-500">
                            Submitted by{" "}
                            <Link
                              href={`/maker/${product.maker}`}
                              className="font-semibold hover:underline"
                            >
                              @{product.maker}
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/product/${product.id}#comments`}
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
                        <span>{product._count.comments}</span>
                      </Link>
                      <UpvoteButton id={product.id} upvotes={product.upvotes} />
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
