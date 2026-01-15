import Link from "next/link"
import { UserMenu } from "@/app/components/user-menu"
import { SearchTrigger } from "@/app/components/search-trigger"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo and primary nav */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-xl font-semibold tracking-tight text-gray-900 hover:text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
          >
            hobbyrider
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 text-base sm:flex" aria-label="Main navigation">
            <SearchTrigger />
            <Link
              href="/submit"
              className="rounded-lg px-3 py-1.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
            >
              Submit
            </Link>
          </nav>
        </div>

        {/* Mobile actions and user menu */}
        <div className="flex items-center gap-2">
          {/* Mobile navigation */}
          <div className="flex items-center gap-2 sm:hidden">
            <SearchTrigger />
            <Link
              href="/submit"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
            >
              Submit
            </Link>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
