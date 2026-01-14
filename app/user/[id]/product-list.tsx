"use client"

import { useState } from "react"
import Link from "next/link"
import { getRelativeTime } from "@/lib/utils"
import { deleteSoftwareByCreator } from "@/app/actions/software"
import { DeleteConfirm } from "@/app/components/delete-confirm"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  tagline: string
  thumbnail: string | null
  upvotes: number
  createdAt: Date
  _count: {
    comments: number
  }
}

type ProductListProps = {
  products: Product[]
  isOwnProfile: boolean
}

export function ProductList({ products, isOwnProfile }: ProductListProps) {
  const router = useRouter()
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (productId: string) => {
    setDeletingProductId(productId)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return

    setIsDeleting(true)
    try {
      await deleteSoftwareByCreator(deletingProductId)
      router.refresh()
      setDeletingProductId(null)
    } catch (error: any) {
      console.error("Delete error:", error)
      alert(error.message || "Failed to delete product. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingProductId(null)
  }

  if (products.length === 0) {
    return <p className="text-gray-600">No products submitted yet.</p>
  }

  const productToDelete = products.find((p) => p.id === deletingProductId)

  return (
    <>
      <ul className="space-y-3">
        {products.map((product) => (
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
                <div className="flex-1">
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
                <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
                  <span className="text-sm font-semibold">
                    {product.upvotes}
                  </span>
                  <span className="text-sm text-gray-600">upvotes</span>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-2 ml-2">
                    <Link
                      href={`/product/${product.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {deletingProductId && productToDelete && (
        <DeleteConfirm
          productName={productToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
