"use client"

import Link from "next/link"
import { UserMenu } from "@/app/components/user-menu"
import { SearchTrigger } from "@/app/components/search-trigger"
import { MobileMenu } from "@/app/components/mobile-menu"
import { PageTitle, NavLinkText } from "@/app/components/typography"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3">
          {/* Logo and primary nav */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 min-w-0">
            <Link 
              href="/" 
              className="hover:text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded flex-shrink-0"
            >
              <PageTitle as="span" className="text-xl text-foreground truncate">
                hobbyrider
              </PageTitle>
            </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 text-base sm:flex" aria-label="Main navigation">
            <SearchTrigger />
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <NavLinkText className="text-base text-foreground">Pricing</NavLinkText>
            </Link>
            <Link
              href="/categories"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <NavLinkText className="text-base text-foreground">Categories</NavLinkText>
            </Link>
            <Link
              href="/submit"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <NavLinkText className="text-base text-foreground">Submit a product</NavLinkText>
            </Link>
          </nav>
        </div>

        {/* Mobile actions and user menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile: Only icons (Search + Menu) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <SearchTrigger />
            <MobileMenu />
          </div>
          {/* Desktop: Full nav + user menu */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <UserMenu />
          </div>
        </div>
        </div>
      </div>
    </header>
  )
}
