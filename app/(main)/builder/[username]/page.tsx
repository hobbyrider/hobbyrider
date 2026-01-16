import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getRelativeTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Try to find user first, then fall back to old maker string (backward compatibility)
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { id: username }],
    },
  })

  const products = await prisma.software.findMany({
    where: user
      ? { makerId: user.id }
      : { maker: username },
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })

  if (products.length === 0 && !user) {
    notFound()
  }

  const totalUpvotes = products.reduce((sum, p) => sum + p.upvotes, 0)
  const totalProducts = products.length
  const displayName = user?.name || user?.username || username

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black mb-6 inline-block"
        >
          ← Back to home
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold">
            {user ? displayName : `@${username}`}
          </h1>
          {user?.username && (
            <p className="mt-1 text-gray-600">@{user.username}</p>
          )}
          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-black">{totalProducts}</span>{" "}
              {totalProducts === 1 ? "product" : "products"}
            </div>
            <div>
              <span className="font-semibold text-black">{totalUpvotes}</span>{" "}
              total upvotes
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">Products</h2>

          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-xl border p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {product.thumbnail && (
                      <div className="h-16 w-16 rounded-lg overflow-hidden border flex-shrink-0 relative">
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          loading="lazy"
                        />
                      </div>
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
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                      >
                        {product.url}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3 h-3"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                            clipRule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
                    <span className="text-sm font-semibold">
                      {product.upvotes}
                    </span>
                    <span className="text-sm text-gray-600">upvotes</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
