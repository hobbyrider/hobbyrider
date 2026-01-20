"use client"

import { VisibilityPanel } from "../visibility/visibility-panel"

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

type VisibilityTabProps = {
  initialProducts?: ProductWithStats[]
}

export function VisibilityTab({ initialProducts = [] }: VisibilityTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Product Visibility & Stats</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage product view counts and upvotes. You can manually set values that will override current stats.
        </p>
      </div>

      <VisibilityPanel initialProducts={initialProducts} />
    </div>
  )
}
