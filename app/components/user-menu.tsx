"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/login"
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border-2 border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Sign up
        </Link>
      </div>
    )
  }

  const user = session.user
  const displayName = user.name || user.username || user.email || "User"

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 rounded-full"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {user.image ? (
          <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 relative">
            <Image
              src={user.image}
              alt={displayName}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 border border-gray-300">
            {displayName[0].toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-[1000]">
          <div className="py-2">
            <Link
              href={`/user/${user.username || user.id}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            >
              Profile
            </Link>
            <Link
              href={`/user/${user.username || user.id}?tab=products`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            >
              My products
            </Link>
            <Link
              href={`/user/${user.username || user.id}/edit`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            >
              Settings
            </Link>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
