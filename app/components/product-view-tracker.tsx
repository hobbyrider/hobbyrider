"use client"

import { useEffect } from "react"
import { trackProductView } from "@/lib/posthog"

type ProductViewTrackerProps = {
  productId: string
  productName: string
}

export function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    trackProductView(productId, productName)
  }, [productId, productName])

  return null
}
