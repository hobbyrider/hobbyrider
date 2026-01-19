"use client"

import { useState, useTransition, useEffect } from "react"
import { seedProductsAction } from "@/app/actions/seed"
import { getAllCategories } from "@/app/actions/categories"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import Link from "next/link"

type SeedResult = {
  url: string
  success: boolean
  productId?: string
  productName?: string
  error?: string
}

export function SeedProductsPanel() {
  const [urls, setUrls] = useState("")
  const [categorySlugs, setCategorySlugs] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [results, setResults] = useState<SeedResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [maxWords, setMaxWords] = useState(2)

  // Load categories on mount
  useEffect(() => {
    getAllCategories().then(cats => {
      setAvailableCategories(cats)
    })
  }, [])

  const handleSubmit = () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && url.startsWith('https://'))

    if (urlList.length === 0) {
      toast.error("Please enter at least one valid URL")
      return
    }

    startTransition(async () => {
      try {
        const seedResults = await seedProductsAction(urlList, categorySlugs, maxWords)
        setResults(seedResults)

        const successCount = seedResults.filter(r => r.success).length
        const errorCount = seedResults.filter(r => !r.success).length

        if (successCount > 0) {
          toast.success(`✅ Successfully seeded ${successCount} product(s)`)
        }
        if (errorCount > 0) {
          toast.error(`❌ Failed to seed ${errorCount} product(s)`)
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to seed products")
      }
    })
  }

  const toggleCategory = (slug: string) => {
    setCategorySlugs(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Seed Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="urls">Product URLs (one per line)</Label>
            <Textarea
              id="urls"
              placeholder="https://example.com&#10;https://another-product.com&#10;https://third-product.com"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              disabled={isPending}
            />
            <p className="text-xs text-gray-500">
              Enter one URL per line. Only HTTPS URLs are accepted.
            </p>
          </div>

          {/* Max Words */}
          <div className="space-y-2">
            <Label htmlFor="maxWords">Max Words in Product Name</Label>
            <input
              id="maxWords"
              type="number"
              min="1"
              max="5"
              value={maxWords}
              onChange={(e) => setMaxWords(parseInt(e.target.value) || 2)}
              className="w-20 rounded border border-gray-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
            <p className="text-xs text-gray-500">
              Product names will be limited to this many words (default: 2)
            </p>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.slug)}
                    disabled={isPending}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      categorySlugs.includes(category.slug)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {categorySlugs.length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected: {categorySlugs.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isPending || !urls.trim()}
            className="w-full sm:w-auto"
          >
            {isPending ? "Seeding..." : `Seed ${urls.split('\n').filter(u => u.trim()).length} Product(s)`}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.success ? '✅' : '❌'} {result.url}
                      </p>
                      {result.success && result.productName && (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-green-700">
                            <strong>Product:</strong> {result.productName}
                          </p>
                          {result.productId && (
                            <Link
                              href={`/product/${result.productId}`}
                              className="text-xs text-green-700 hover:underline"
                            >
                              View Product →
                            </Link>
                          )}
                        </div>
                      )}
                      {!result.success && result.error && (
                        <p className="mt-1 text-xs text-red-700">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Help: Fix Products */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">🔧 Fix Existing Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Use these commands to fix individual products or all seeded products with quality issues.
          </p>
          
          <div className="space-y-3">
            {/* Fix Logos */}
            <div className="rounded-lg border border-blue-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    1
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Fix Low-Quality Logos</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Finds and replaces low-quality logos (.ico, small favicons) with high-quality logos (SVG, WebP, large PNGs).
                  </p>
                  <div className="bg-gray-50 rounded p-2 font-mono text-xs text-gray-800 border border-gray-200">
                    <div className="mb-1">
                      <span className="text-gray-500"># Fix all low-quality logos:</span>
                    </div>
                    <div className="text-blue-700">npx tsx scripts/fix-product-logos.ts</div>
                    <div className="mt-2 mb-1">
                      <span className="text-gray-500"># Fix specific product:</span>
                    </div>
                    <div className="text-blue-700">npx tsx scripts/fix-product-logos.ts https://example.com</div>
                    <div className="mt-2 mb-1">
                      <span className="text-gray-500"># Force re-extract all (recommended if logos look weird):</span>
                    </div>
                    <div className="text-blue-700">npx tsx scripts/fix-product-logos.ts --force</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fix Names/Taglines */}
            <div className="rounded-lg border border-blue-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    2
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Fix Poor Names & Taglines</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Fixes names with trailing words ("PostHog We" → "PostHog"), domain extensions ("forgetbill.com" → "Forgetbill"), and taglines that are URLs or redundant.
                  </p>
                  <div className="bg-gray-50 rounded p-2 font-mono text-xs text-gray-800 border border-gray-200">
                    <div className="mb-1">
                      <span className="text-gray-500"># Fix all seeded products:</span>
                    </div>
                    <div className="text-blue-700">npx tsx scripts/fix-product-names-taglines.ts</div>
                    <div className="mt-2 mb-1">
                      <span className="text-gray-500"># Fix specific product:</span>
                    </div>
                    <div className="text-blue-700">npx tsx scripts/fix-product-names-taglines.ts https://example.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Rules Summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                    📋
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Quality Rules</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    All new products automatically follow quality rules. See <code className="bg-gray-200 px-1 rounded text-xs">docs/PRODUCT_SEEDING_QUALITY_RULES.md</code> for complete rules and examples.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1.5">
                    <div>
                      <strong>Names:</strong> Brand name only, max 2 words, no trailing "We"/"The", no domains (.com, .io)
                      <div className="text-xs text-gray-500 mt-0.5">❌ "PostHog We" → ✅ "PostHog" | ❌ "forgetbill.com" → ✅ "Forgetbill"</div>
                    </div>
                    <div>
                      <strong>Taglines:</strong> Max 70 chars, no URLs, no redundancy, concise value proposition
                      <div className="text-xs text-gray-500 mt-0.5">❌ "forgetbill.com" → ✅ "Never forget a bill again"</div>
                    </div>
                    <div>
                      <strong>Logos:</strong> Prioritizes SVG &gt; WebP &gt; Large PNG (512x512+) &gt; Small PNG &gt; ICO
                      <div className="text-xs text-gray-500 mt-0.5">Automatically finds best quality logo available</div>
                    </div>
                    <div>
                      <strong>Taglines:</strong> Must end with a period (.)
                      <div className="text-xs text-gray-500 mt-0.5">Automatically added if missing</div>
                    </div>
                    <div>
                      <strong>403 Errors:</strong> If a site blocks requests (bot protection), add manually or wait and retry
                      <div className="text-xs text-gray-500 mt-0.5">Some sites use Cloudflare or similar protection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
