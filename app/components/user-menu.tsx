"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
    )
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="px-3 py-2 text-sm font-semibold hover:underline"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3 py-2 text-sm font-semibold rounded-lg border hover:bg-black hover:text-white transition"
        >
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/user/${session.user.username || session.user.id}`}
        className="text-sm font-semibold hover:underline"
      >
        {session.user.name || session.user.username || session.user.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-3 py-2 text-sm text-gray-600 hover:text-black hover:underline"
      >
        Sign out
      </button>
    </div>
  )
}
