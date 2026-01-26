"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs sm:text-sm"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
        >
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  const user = session.user
  const displayName = user.name || user.username || user.email || "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 p-0"
          aria-label="User menu"
        >
          {user.image ? (
            <div className="h-8 w-8 rounded-full overflow-hidden border border-border relative">
              <Image
                src={user.image}
                alt={displayName}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground border border-border">
              {displayName[0].toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={`/user/${user.username || user.id}`} className="cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/user/${user.username || user.id}?tab=products`} className="cursor-pointer">
            My products
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/user/${user.username || user.id}/edit`} className="cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
