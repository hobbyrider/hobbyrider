"use client"

import { ModerationPanel } from "../moderation/moderation-panel"
import { ResolvedReportPanel } from "../moderation/resolved-report-panel"
import { ProductManagementPanel } from "../moderation/product-management-panel"
import { OwnershipClaimsPanel } from "../ownership-claims/ownership-claims-panel"

type ModerationTabProps = {
  initialReports?: any[]
  initialArchivedReports?: any[]
  initialProducts?: any[]
  initialClaims?: any[]
}

export function ModerationTab({
  initialReports = [],
  initialArchivedReports = [],
  initialProducts = [],
  initialClaims = []
}: ModerationTabProps) {
  const reports = initialReports
  const archivedReports = initialArchivedReports
  const products = initialProducts
  const claims = initialClaims

  const pendingReports = reports.filter((r: any) => r.status === "pending" && !r.isArchived)
  const reviewedReports = reports.filter((r: any) => r.status !== "pending" && !r.isArchived)
  const archived = archivedReports.filter((r: any) => r.isArchived)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* Content */}
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

      {/* Reviewed Reports */}
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

      {/* Product Management */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Product Management</h2>
        <p className="mb-4 text-sm text-gray-600">
          Manage product ownership status. Set products as "seeded" to allow ownership claims, or "owned" for products that are already owned by their creators.
        </p>
        <ProductManagementPanel initialProducts={products} />
      </div>
    </div>
  )
}
