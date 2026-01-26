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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          aria-label="Open menu"
          aria-expanded={open}
          suppressHydrationWarning
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
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
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/categories" onClick={handleLinkClick}>
                <NavLinkText>Categories</NavLinkText>
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/pricing" onClick={handleLinkClick}>
                <NavLinkText>Pricing</NavLinkText>
              </Link>
            </Button>
          </SheetClose>
          
          {/* Divider before auth actions */}
          <div className="my-2 border-t border-border"></div>
          
          {/* Auth Actions */}
          {session ? (
            <>
              <SheetClose asChild>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href={`/user/${session.user.username || session.user.id}`} onClick={handleLinkClick}>
                    <NavLinkText>Profile</NavLinkText>
                  </Link>
                </Button>
              </SheetClose>
              
              {/* Divider before logout */}
              <div className="my-2 border-t border-border"></div>
              
              {/* Logout - At the bottom */}
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLinkClick()
                    signOut({ callbackUrl: "/" })
                  }}
                >
                  <NavLinkText>Logout</NavLinkText>
                </Button>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/login" onClick={handleLinkClick}>
                    <NavLinkText>Login</NavLinkText>
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/signup" onClick={handleLinkClick}>
                    <NavLinkText>Sign up</NavLinkText>
                  </Link>
                </Button>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
