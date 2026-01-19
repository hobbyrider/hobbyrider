"use client"

import { useState, useTransition } from "react"
import { updateProductOwnershipStatus, deleteSoftwareAsAdmin } from "@/app/actions/software"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"

type Product = {
  id: string
  name: string
  url: string
  ownershipStatus: string
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

type ProductManagementPanelProps = {
  initialProducts: Product[]
}

export function ProductManagementPanel({ initialProducts }: ProductManagementPanelProps) {
  const [products, setProducts] = useState(initialProducts)
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleStatusChange = async (productId: string, newStatus: "seeded" | "owned") => {
    setUpdatingId(productId)
    
    startTransition(async () => {
      try {
        await updateProductOwnershipStatus(productId, newStatus)
        toast.success(`Product status updated to ${newStatus}`)
        
        // Update local state
        setProducts(products.map((p) => 
          p.id === productId 
            ? { ...p, ownershipStatus: newStatus, seededBy: newStatus === "seeded" ? (p.seededBy || "admin") : null }
            : p
        ))
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to update product status")
      } finally {
        setUpdatingId(null)
      }
    })
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(productId)
    
    startTransition(async () => {
      try {
        await deleteSoftwareAsAdmin(productId)
        toast.success(`Product "${productName}" deleted successfully`)
        
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId))
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product")
      } finally {
        setDeletingId(null)
      }
    })
  }

  const getPublishedBy = (product: Product) => {
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const isUpdating = updatingId === product.id
              const currentStatus = product.ownershipStatus as "seeded" | "owned"
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="text-xs text-gray-600 font-mono">
                      {product.id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/product/${product.id}`}
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
                        currentStatus === "seeded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getPublishedBy(product)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/product/${product.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleStatusChange(product.id, "seeded")}
                        disabled={isUpdating || currentStatus === "seeded" || deletingId === product.id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          currentStatus === "seeded"
                            ? "border-blue-300 bg-blue-50 text-blue-700 cursor-not-allowed"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isUpdating && currentStatus !== "seeded" ? "Updating..." : "Set Seeded"}
                      </button>
                      <button
                        onClick={() => handleStatusChange(product.id, "owned")}
                        disabled={isUpdating || currentStatus === "owned" || deletingId === product.id}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          currentStatus === "owned"
                            ? "border-green-300 bg-green-50 text-green-700 cursor-not-allowed"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isUpdating && currentStatus !== "owned" ? "Updating..." : "Set Owned"}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id || isUpdating}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete product"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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
