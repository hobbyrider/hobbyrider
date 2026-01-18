import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Legacy route: /builder/[username]
 * Redirects to /user/[id] for consistency
 */
export default async function BuilderPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Try to find user by username or ID
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { id: username }],
    },
    select: { id: true, username: true },
  })

  // If user found, redirect to new route
  if (user) {
    redirect(`/user/${user.username || user.id}`)
  }

  // If no user found, still redirect to /user/[username] (will show 404 there if needed)
  redirect(`/user/${username}`)
}
