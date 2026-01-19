import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getReports, isAdmin } from "@/app/actions/moderation"
import { getAllProductsForAdmin } from "@/app/actions/software"
import { getPendingOwnershipClaims } from "@/app/actions/ownership"
import { ModerationPanel } from "./moderation-panel"
import { ResolvedReportPanel } from "./resolved-report-panel"
import { ProductManagementPanel } from "./product-management-panel"
import { OwnershipClaimsPanel } from "../ownership-claims/ownership-claims-panel"
import { getRelativeTime } from "@/lib/utils"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ModerationPage() {
  const session = await getSession()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/moderation")
  }

  const admin = await isAdmin()
  
  if (!admin) {
    // Check the actual user record to see what's wrong
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, username: true, isAdmin: true },
    })
    
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
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
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-medium mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Prisma Studio: <code className="bg-yellow-100 px-1 rounded">npx prisma studio</code></li>
                <li>Find your user (email: {user?.email || "your-email"})</li>
                <li>Set <code className="bg-yellow-100 px-1 rounded">isAdmin</code> to <code className="bg-yellow-100 px-1 rounded">true</code></li>
                <li>Log out and log back in</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const [reports, archivedReports, products, claims] = await Promise.all([
    getReports(),
    getReports(undefined, true),
    getAllProductsForAdmin().catch(() => []),
    getPendingOwnershipClaims().catch(() => []),
  ])

  const pendingReports = reports.filter((r: any) => r.status === "pending" && !r.isArchived)
  const reviewedReports = reports.filter((r: any) => r.status !== "pending" && !r.isArchived)
  const archived = archivedReports.filter((r: any) => r.isArchived)

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Content Moderation
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Review and manage reported content
          </p>
        </header>

        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-gray-600">Pending Reports</div>
            <div className="text-2xl font-semibold text-gray-900">{pendingReports.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-gray-600">Ownership Claims</div>
            <div className="text-2xl font-semibold text-gray-900">{claims.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-gray-600">Reviewed Reports</div>
            <div className="text-2xl font-semibold text-gray-900">{reviewedReports.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-gray-600">Archived</div>
            <div className="text-2xl font-semibold text-gray-900">{archived.length}</div>
          </div>
        </div>

        {pendingReports.length === 0 && claims.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-base text-gray-600">
              No pending reports or ownership claims. Great job! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingReports.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Pending Reports ({pendingReports.length})
                </h2>
                <div className="space-y-4">
                  {pendingReports.map((report: any) => (
                    <ModerationPanel key={report.id} report={report} />
                  ))}
                </div>
              </div>
            )}

            {claims.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Ownership Claims ({claims.length})
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Review and approve ownership claims for seeded products.
                </p>
                <OwnershipClaimsPanel initialClaims={claims} />
              </div>
            )}
          </div>
        )}

        {reviewedReports.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Reviewed Reports ({reviewedReports.length})
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Manage previously reviewed reports. You can unhide hidden content or permanently delete it.
            </p>
            <div className="space-y-4">
              {reviewedReports.map((report: any) => (
                <ResolvedReportPanel key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Archived Reports ({archived.length})
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Archived reports are hidden from the main view but can be restored if needed.
            </p>
            <div className="space-y-4">
              {archived.map((report: any) => (
                <ResolvedReportPanel key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}

        {/* Product Management Section */}
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Product Management ({products.length})
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Manage product ownership status. Set products as "seeded" to allow ownership claims, or "owned" for products that are already owned by their creators.
          </p>
          {products.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-base text-gray-600">No products found</p>
            </div>
          ) : (
            <ProductManagementPanel initialProducts={products} />
          )}
        </div>
      </div>
    </main>
  )
}
