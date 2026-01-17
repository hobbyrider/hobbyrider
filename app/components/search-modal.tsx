"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { searchSoftware, getDiscoverData } from "@/app/actions/search"
import { getRelativeTime } from "@/lib/utils"

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

  // Close on Escape and prevent background scroll while open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  const popularCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => b._count.products - a._count.products)
      .slice(0, 8)
  }, [categories])

  const goTo = (href: string) => {
    router.push(href)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        aria-label="Close search"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-12 sm:mt-20 w-[min(920px,calc(100%-1rem))] sm:w-[min(920px,calc(100%-2rem))] rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Search Input Header */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 104.473 8.708l2.41 2.409a.75.75 0 101.06-1.06l-2.409-2.41A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 117.999.001A4 4 0 015 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products or builders..."
            className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 outline-none placeholder:text-gray-500"
          />

          <div className="flex items-center gap-2">
            {searching && (
              <span className="text-xs text-gray-500">Searching…</span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
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
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-8rem)] sm:max-h-[70vh] overflow-y-auto">
          {/* Main Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 min-w-0">
            {showSearchResults ? (
              <>
                {results.length === 0 && !searching ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-600">No results found for "{trimmed}"</p>
                    <p className="mt-2 text-xs text-gray-500">Try different keywords or browse categories</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {results.slice(0, 3).map((item) => (
                      <li key={item.id} className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50">
                        <button
                          type="button"
                          onClick={() => goTo(`/product/${item.id}`)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3 flex-1 min-w-0">
                              {item.thumbnail && (
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 relative">
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900">{item.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {getRelativeTime(item.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-1">{item.tagline}</p>
                                {item.categories?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {item.categories.slice(0, 3).map((c) => (
                                      <span
                                        key={c.id}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                      >
                                        {c.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
                                <span className="font-semibold text-gray-900">{item.upvotes}</span>
                                <span className="ml-1 text-gray-600">upvotes</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {results.length > 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(trimmed)}`}
                      onClick={onClose}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-4"
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Popular Categories
                    </p>
                    <Link
                      href="/categories"
                      onClick={onClose}
                      className="text-xs font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-4"
                    >
                      View all →
                    </Link>
                  </div>

                  {discoverLoading ? (
                    <p className="text-sm text-gray-600">Loading…</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => goTo(`/?category=${c.slug}`)}
                          className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Products */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Top Products
                  </p>
                  {discoverLoading ? (
                    <p className="text-sm text-gray-600">Loading…</p>
                  ) : (
                    <ul className="space-y-2">
                      {topProducts.slice(0, 3).map((p) => (
                        <li key={p.id} className="group rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:bg-gray-50">
                          <button
                            type="button"
                            onClick={() => goTo(`/product/${p.id}`)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {p.thumbnail && (
                                  <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 relative">
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
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900">{p.name}</div>
                                  <div className="mt-0.5 text-sm text-gray-600 line-clamp-1">
                                    {p.tagline}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm">
                                <span className="font-semibold text-gray-900">{p.upvotes}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

