"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NavLinkText } from "@/app/components/typography"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-gray-700"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="flex flex-col gap-1 mt-6">
          {/* Primary CTA - Full width Button */}
          <SheetClose asChild>
            <Button asChild className="w-full justify-start" variant="default">
              <Link href="/submit" onClick={handleLinkClick}>
                <NavLinkText>Submit a product</NavLinkText>
              </Link>
            </Button>
          </SheetClose>

          {/* Navigation Links */}
          <SheetClose asChild>
            <Link
              href="/categories"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <NavLinkText>Categories</NavLinkText>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/pricing"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <NavLinkText>Pricing</NavLinkText>
            </Link>
          </SheetClose>
          
          {/* Divider before auth actions */}
          <div className="my-2 border-t border-gray-200"></div>
          
          {/* Auth Actions */}
          {session ? (
            <>
              <SheetClose asChild>
                <Link
                  href={`/user/${session.user.username || session.user.id}`}
                  onClick={handleLinkClick}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <NavLinkText>Profile</NavLinkText>
                </Link>
              </SheetClose>
              
              {/* Divider before logout */}
              <div className="my-2 border-t border-gray-200"></div>
              
              {/* Logout - At the bottom */}
              <SheetClose asChild>
                <button
                  onClick={() => {
                    handleLinkClick()
                    signOut({ callbackUrl: "/" })
                  }}
                  className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <NavLinkText>Logout</NavLinkText>
                </button>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <NavLinkText>Login</NavLinkText>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/signup"
                  onClick={handleLinkClick}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 border-2 border-gray-300 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <NavLinkText>Sign up</NavLinkText>
                </Link>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
