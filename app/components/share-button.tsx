"use client"

import { useState, useEffect } from "react"
import { CopyIcon } from "@/app/components/icons"
import { getProductFullUrl } from "@/lib/slug"
import { trackEvent } from "@/lib/posthog"

type ShareButtonProps = {
  productId: string
  productName: string
  productSlug?: string | null // Optional slug - will be generated if missing
}

export function ShareButton({ productId, productName, productSlug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>("")

  // Get canonical URL (client-side, uses current window origin)
  useEffect(() => {
    const url = getProductFullUrl(productSlug || null, productId, window.location.origin)
    setShareUrl(url)
  }, [productId, productSlug])

  const handleShare = async () => {
    const url = shareUrl || `${window.location.origin}/products/product-${productId}` // Fallback

    try {
      await navigator.clipboard.writeText(url)
      // Track product URL copied event
      trackEvent("product_url_copied", {
        product_id: productId,
        product_name: productName,
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        // Track product URL copied event (fallback)
        trackEvent("product_url_copied", {
          product_id: productId,
          product_name: productName,
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error("Failed to copy:", fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 rounded"
      aria-label={`Copy URL for ${productName}`}
      title={copied ? "Copied!" : "Copy URL"}
    >
      <CopyIcon />
      {copied && (
        <span className="text-xs text-green-600 font-medium">Copied!</span>
      )}
    </button>
  )
}
