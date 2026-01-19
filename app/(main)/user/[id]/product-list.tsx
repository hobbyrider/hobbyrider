"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getRelativeTime } from "@/lib/utils"
import { deleteSoftwareByCreator } from "@/app/actions/software"
import { DeleteConfirm } from "@/app/components/delete-confirm"
import { CommentIcon } from "@/app/components/icons"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getProductUrl } from "@/lib/slug"

type Product = {
  id: string
  name: string
  slug: string | null // URL-friendly slug
  tagline: string
  thumbnail: string | null
  upvotes: number
  createdAt: Date
  _count?: {
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
      toast.success("Product deleted successfully")
      router.refresh()
      setDeletingProductId(null)
    } catch (error: any) {
      console.error("Delete error:", error)
      toast.error(error.message || "Failed to delete product. Please try again.")
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
      <ul className="space-y-4">
        {products.map((product) => (
          <li
            key={product.id}
            className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                {product.thumbnail && (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-white">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 64px, 80px"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <Link
                      href={getProductUrl(product.slug || null, product.id)}
                      className="font-semibold text-gray-900 hover:text-gray-700 transition-colors break-words"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {getRelativeTime(product.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Link
                  href={`${getProductUrl(product.slug || null, product.id)}#comments`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                  title="Comments"
                  aria-label={`${product._count?.comments || 0} comments`}
                >
                  <CommentIcon className="w-4 h-4" />
                  <span>{product._count?.comments || 0}</span>
                </Link>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 sm:px-3 py-1.5 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {product.upvotes}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">upvotes</span>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      href={`${getProductUrl(product.slug || null, product.id)}/edit`}
                      className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
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
