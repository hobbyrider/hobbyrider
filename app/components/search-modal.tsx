"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { searchSoftware, getDiscoverData } from "@/app/actions/search"
import { getRelativeTime } from "@/lib/utils"
import { getProductUrl } from "@/lib/slug"
import { trackEvent } from "@/lib/posthog"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryItem = {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

type ProductItem = {
  id: string
  name: string
  slug: string | null // URL-friendly slug
  tagline: string
  thumbnail: string | null
  maker: string | null
  upvotes: number
  createdAt: Date
  categories: { id: string; name: string; slug: string }[]
}

type SearchResult = {
  id: string
  name: string
  slug: string | null // URL-friendly slug
  tagline: string
  url: string
  maker: string | null
  thumbnail: string | null
  upvotes: number
  commentCount: number
  categories: { id: string; name: string; slug: string }[]
  createdAt: Date
}

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [topProducts, setTopProducts] = useState<ProductItem[]>([])

  const trimmed = query.trim()
  const showSearchResults = trimmed.length > 0

  useEffect(() => {
    if (!open) return

    // Track search modal opened
    trackEvent("search_modal_opened")

    // focus input when opening
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return

    // load discover data (categories + top products)
    setDiscoverLoading(true)
    getDiscoverData()
      .then((data) => {
        setCategories(data.categories as any)
        setTopProducts(data.topProducts as any)
      })
      .catch((e) => console.error("Discover load error:", e))
      .finally(() => setDiscoverLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!trimmed) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchSoftware(trimmed)
        setResults(r as any)
      } catch (e) {
        console.error("Search error:", e)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open, trimmed])

  // Focus input when opening (Dialog handles Escape and body scroll)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  const popularCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => b._count.products - a._count.products)
      .slice(0, 8)
  }, [categories])

  const goTo = (href: string, item?: { id: string; name: string }) => {
    // Track search result click if item provided
    if (item) {
      trackEvent("search_result_clicked", {
        product_id: item.id,
        product_name: item.name,
        search_query: trimmed || undefined,
      })
    }
    router.push(href)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[920px] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col top-[5%] sm:top-[8%] translate-y-0 left-[50%] translate-x-[-50%] [&>button.absolute]:hidden">
        <DialogTitle className="sr-only">Search for products or builders</DialogTitle>
        {/* Search Input Header */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 104.473 8.708l2.41 2.409a.75.75 0 101.06-1.06l-2.409-2.41A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 117.999.001A4 4 0 015 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products or builders..."
            className="flex-1 border-0 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
          />

          <div className="flex items-center gap-2">
            {searching && (
              <span className="text-xs text-muted-foreground">Searching…</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close search"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.47 4.47a.75.75 0 011.06 0L10 8.94l4.47-4.47a.75.75 0 111.06 1.06L11.06 10l4.47 4.47a.75.75 0 11-1.06 1.06L10 11.06l-4.47 4.47a.75.75 0 11-1.06-1.06L8.94 10 4.47 5.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 min-w-0">
            {showSearchResults ? (
              <>
                {results.length === 0 && !searching ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No results found for "{trimmed}"</p>
                    <p className="mt-2 text-xs text-muted-foreground">Try different keywords or browse categories</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {results.slice(0, 3).map((item) => (
                      <li key={item.id} className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-input hover:bg-accent">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => goTo(getProductUrl(item.slug || null, item.id), { id: item.id, name: item.name })}
                          className="w-full justify-start h-auto p-0 hover:bg-transparent text-left"
                        >
                          <div className="flex items-start justify-between gap-4 w-full">
                            <div className="flex gap-3 flex-1 min-w-0 text-left">
                              {item.thumbnail && (
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden relative bg-background">
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-1.5"
                                    sizes="48px"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground">{item.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getRelativeTime(item.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-1 text-left">{item.tagline}</p>
                                {item.categories?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {item.categories.slice(0, 3).map((c) => (
                                      <span
                                        key={c.id}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                      >
                                        {c.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0 text-sm text-left">
                              <span className="font-semibold text-foreground">{item.upvotes}</span>
                              <span className="ml-1 text-muted-foreground">upvotes</span>
                            </div>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {results.length > 3 && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(trimmed)}`}
                      onClick={onClose}
                      className="text-sm font-medium text-foreground hover:text-primary underline underline-offset-4"
                    >
                      View all {results.length} results →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Popular Categories */}
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Popular Categories
                    </p>
                    <Link
                      href="/categories"
                      onClick={onClose}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                    >
                      View all →
                    </Link>
                  </div>

                  {discoverLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.map((c) => (
                        <Button
                          key={c.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => goTo(`/?category=${c.slug}`)}
                          className="rounded-full"
                        >
                          {c.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Products */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Top Products
                  </p>
                  {discoverLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <ul className="space-y-2">
                      {topProducts.slice(0, 3).map((p) => (
                        <li key={p.id} className="group rounded-lg border border-border bg-card p-3 transition-all hover:border-input hover:bg-accent">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => goTo(getProductUrl(p.slug || null, p.id), { id: p.id, name: p.name })}
                            className="w-full justify-start h-auto p-0 hover:bg-transparent text-left"
                          >
                            <div className="flex items-center justify-between gap-3 w-full">
                              <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                {p.thumbnail && (
                                  <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-border relative">
                                    <Image
                                      src={p.thumbnail}
                                      alt={p.name}
                                      fill
                                      className="object-cover"
                                      sizes="40px"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-semibold text-foreground">{p.name}</div>
                                  <div className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                    {p.tagline}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-sm text-left">
                                <span className="font-semibold text-foreground">{p.upvotes}</span>
                              </div>
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

