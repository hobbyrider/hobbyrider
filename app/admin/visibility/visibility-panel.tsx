"use client"

import { useState, useTransition } from "react"
import { updateProductStats } from "@/app/actions/software"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { getProductUrl, generateSlug } from "@/lib/slug"

type ProductWithStats = {
  id: string
  name: string
  slug: string | null
  url: string
  ownershipStatus: string
  viewCount: number
  upvotes: number
  seededBy: string | null
  makerId: string | null
  makerUser: {
    id: string
    username: string | null
    name: string | null
  } | null
  seededByUser: {
    id: string
    username: string | null
    name: string | null
  } | null
}

type VisibilityPanelProps = {
  initialProducts: ProductWithStats[]
}

export function VisibilityPanel({ initialProducts }: VisibilityPanelProps) {
  const [products, setProducts] = useState(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ viewCount: string; upvotes: string }>({
    viewCount: "",
    upvotes: "",
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEditClick = (product: ProductWithStats) => {
    setEditingId(product.id)
    setEditValues({
      viewCount: product.viewCount.toString(),
      upvotes: product.upvotes.toString(),
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({ viewCount: "", upvotes: "" })
  }

  const handleSave = async (productId: string) => {
    const viewCount = editValues.viewCount.trim() === "" ? null : parseInt(editValues.viewCount, 10)
    const upvotes = editValues.upvotes.trim() === "" ? null : parseInt(editValues.upvotes, 10)

    if (viewCount !== null && (isNaN(viewCount) || viewCount < 0)) {
      toast.error("View count must be a non-negative number")
      return
    }

    if (upvotes !== null && (isNaN(upvotes) || upvotes < 0)) {
      toast.error("Upvotes must be a non-negative number")
      return
    }

    startTransition(async () => {
      try {
        await updateProductStats(productId, viewCount, upvotes)
        toast.success("Product stats updated successfully")

        // Update local state
        setProducts(
          products.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                viewCount: viewCount !== null ? viewCount : p.viewCount,
                upvotes: upvotes !== null ? upvotes : p.upvotes,
              }
            }
            return p
          })
        )

        setEditingId(null)
        setEditValues({ viewCount: "", upvotes: "" })
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to update product stats")
      }
    })
  }

  const getPublishedBy = (product: ProductWithStats) => {
    if (product.ownershipStatus === "seeded" && product.seededByUser) {
      return product.seededByUser.name || product.seededByUser.username || "Unknown"
    }
    if (product.makerUser) {
      return product.makerUser.name || product.makerUser.username || "Unknown"
    }
    return "Unknown"
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          Update product view counts and upvotes. New values will override current stats and continue counting from the new baseline.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published By
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upvotes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const isEditing = editingId === product.id

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="text-xs text-gray-600 font-mono">
                      {product.id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={getProductUrl(product.slug || generateSlug(product.name), product.id)}
                      className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors truncate block max-w-xs"
                    >
                      {product.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.ownershipStatus === "seeded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.ownershipStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getPublishedBy(product)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.viewCount}
                        onChange={(e) =>
                          setEditValues({ ...editValues, viewCount: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder={product.viewCount.toString()}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{product.viewCount}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.upvotes}
                        onChange={(e) =>
                          setEditValues({ ...editValues, upvotes: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder={product.upvotes.toString()}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{product.upvotes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(product.id)}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(product)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit Stats
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
