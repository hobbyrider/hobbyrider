import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { isAdmin } from "@/app/actions/moderation"
import { getReports } from "@/app/actions/moderation"
import { getAllProductsForAdmin, getAllProductsWithStats } from "@/app/actions/software"
import { getPendingOwnershipClaims } from "@/app/actions/ownership"
import { AdminTabs } from "./admin-tabs"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin")
  }

  const admin = await isAdmin()
  
  if (!admin) {
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, username: true, isAdmin: true },
    })
    
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <h1 className="mb-4 text-2xl font-semibold text-red-900">Access Denied</h1>
          <p className="mb-4 text-base text-red-700">
            You must be an admin to access this page.
          </p>
          <div className="rounded-lg bg-white p-4 text-sm">
            <p className="font-medium text-gray-900">Your Account Info:</p>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>Email: {user?.email || "N/A"}</li>
              <li>Username: {user?.username || "N/A"}</li>
              <li>User ID: {user?.id || "N/A"}</li>
              <li className="font-semibold">
                Admin Status: {user?.isAdmin ? "✅ True" : "❌ False"}
              </li>
            </ul>
          </div>
        </div>
      </main>
    )
  }

  // Pre-fetch data for all tabs
  const [reports, archivedReports, products, claims, productsWithStats] = await Promise.all([
    getReports().catch(() => []),
    getReports(undefined, true).catch(() => []),
    getAllProductsForAdmin().catch(() => []),
    getPendingOwnershipClaims().catch(() => []),
    getAllProductsWithStats().catch(() => []),
  ])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Manage content, seed products, and oversee Hobbyrider operations.
        </p>
      </div>

      <AdminTabs 
        initialReports={reports}
        initialArchivedReports={archivedReports}
        initialProducts={products}
        initialClaims={claims}
        initialProductsWithStats={productsWithStats}
      />
    </main>
  )
}
