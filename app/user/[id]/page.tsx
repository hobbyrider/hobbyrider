import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/get-session"
import { ProductList } from "./product-list"

export const dynamic = "force-dynamic"

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  // Try to find by username first, then by ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: id }, { id }],
    },
    include: {
      madeProducts: {
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

  if (!user) {
    notFound()
  }

  const totalUpvotes = user.madeProducts.reduce(
    (sum, p) => sum + p.upvotes,
    0
  )
  const totalProducts = user.madeProducts.length

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === user.id

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
          <h1 className="text-4xl font-bold">
            {user.name || user.username || user.email}
          </h1>
          {user.username && (
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
            <div>
              Member since {new Date(user.createdAt).getFullYear()}
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <ProductList products={user.madeProducts} isOwnProfile={isOwnProfile} />
        </section>
      </div>
    </main>
  )
}
