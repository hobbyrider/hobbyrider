"use client"

import { useState, useEffect, useRef } from "react"
import { searchSoftware } from "@/app/actions/search"
import Link from "next/link"
import Image from "next/image"
import { getRelativeTime } from "@/lib/utils"

type SoftwareItem = {
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

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SoftwareItem[]>([])
  const [searching, setSearching] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If query is empty, clear results
    if (!query.trim()) {
      setResults([])
      setSearching(false)
      return
    }

    // Set loading state
    setSearching(true)

    // Debounce search by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchSoftware(query)
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    // Search is now handled by useEffect, but we keep this for form submission
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black mb-4 sm:mb-6 inline-block"
        >
          ← Back to home
        </Link>

        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">Search</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Search for products by name, tagline, or builder
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search... (results update as you type)"
              className="flex-1 rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-base focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0"
              autoFocus
            />
            {searching && (
              <div className="flex items-center px-4 text-sm text-gray-500">
                Searching...
              </div>
            )}
          </div>
        </form>

        {results.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              {results.length} {results.length === 1 ? "result" : "results"}
            </h2>

            <ul className="space-y-3">
              {results.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border p-3 sm:p-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      {item.thumbnail && (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-white">
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            fill
                            className="object-contain p-1.5 sm:p-2"
                            sizes="(max-width: 640px) 48px, 64px"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/product/${item.id}`}
                            className="font-semibold text-sm sm:text-base underline underline-offset-4 inline-flex items-center gap-1 hover:text-gray-600"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {getRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm sm:text-base text-gray-600 line-clamp-2">{item.tagline}</p>
                        {item.categories && item.categories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {item.maker && (
                          <p className="mt-1 text-xs text-gray-500">
                            Submitted by{" "}
                            <Link
                              href={`/user/${item.maker}`}
                              className="font-semibold hover:underline"
                            >
                              @{item.maker}
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <Link
                        href={`/product/${item.id}#comments`}
                        className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.188 1.705.338 2.57.45v3.025a.75.75 0 001.163.638l3.086-2.126a26.75 26.75 0 001.88-.128c2.14-.344 4.334-.524 6.57-.524h.25a.75.75 0 00.75-.75v-5.148c0-1.413-.993-2.67-2.43-2.902A41.403 41.403 0 0010 2zm8.75 10.5h-.25a25.25 25.25 0 00-6.57.524c-1.437.232-2.43 1.49-2.43 2.902v.25a.75.75 0 00.75.75h.25a25.25 25.25 0 006.57-.524c1.437-.232 2.43-1.49 2.43-2.902v-.25a.75.75 0 00-.75-.75zM8.75 6.75a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item.commentCount}</span>
                      </Link>
                      <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
                        <span className="text-sm font-semibold">
                          {item.upvotes}
                        </span>
                        <span className="text-sm text-gray-600">upvotes</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {query && results.length === 0 && !searching && (
          <p className="text-gray-600">No results found.</p>
        )}
      </div>
    </main>
  )
}
