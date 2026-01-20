"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"
import { identifyUser, resetUser } from "@/lib/posthog"

function PostHogUserIdentifier() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      // Identify user in PostHog
      identifyUser(session.user.id, {
        email: session.user.email || undefined,
        username: session.user.username || undefined,
        name: session.user.name || undefined,
      })
    } else {
      // Reset user identification on logout
      resetUser()
    }
  }, [session])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <PostHogUserIdentifier />
      {children}
    </SessionProvider>
  )
}
