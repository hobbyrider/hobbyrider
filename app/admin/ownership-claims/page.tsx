import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getPendingOwnershipClaims } from "@/app/actions/ownership"
import { OwnershipClaimsPanel } from "./ownership-claims-panel"

export const dynamic = "force-dynamic"

export default async function OwnershipClaimsPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/ownership-claims")
  }

  // Check if user is admin
  const { prisma } = await import("@/lib/prisma")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect("/")
  }

  // Get pending claims
  const claims = await getPendingOwnershipClaims().catch(() => [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ownership Claims</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve ownership claims for seeded products
        </p>
      </div>

      <OwnershipClaimsPanel initialClaims={claims} />
    </div>
  )
}
