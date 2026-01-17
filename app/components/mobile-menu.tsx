"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavLinkText } from "@/app/components/typography"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

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
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <nav className="flex flex-col gap-1 mt-6">
          <Link
            href="/submit"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <NavLinkText>Submit a product</NavLinkText>
          </Link>
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <NavLinkText>Categories</NavLinkText>
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <NavLinkText>Pricing</NavLinkText>
          </Link>
          
          <div className="my-2 border-t border-gray-200"></div>
          
          {session ? (
            <>
              <Link
                href={`/user/${session.user.username || session.user.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                <NavLinkText>Profile</NavLinkText>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                <NavLinkText>Login</NavLinkText>
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-900 border-2 border-gray-300 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                <NavLinkText>Sign up</NavLinkText>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
