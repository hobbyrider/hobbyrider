"use client"

import { useEffect } from "react"
import { trackCategoryView } from "@/lib/posthog"

type CategoryViewTrackerProps = {
  categorySlug: string
  categoryName: string
}

export function CategoryViewTracker({ categorySlug, categoryName }: CategoryViewTrackerProps) {
  useEffect(() => {
    trackCategoryView(categorySlug, categoryName)
  }, [categorySlug, categoryName])

  return null
}
