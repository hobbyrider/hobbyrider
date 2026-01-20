"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ModerationTab } from "./tabs/moderation-tab"
import { SeedProductsTab } from "./tabs/seed-products-tab"
import { VisibilityTab } from "./tabs/visibility-tab"

type AdminTab = "moderation" | "seed-products" | "visibility"

const tabs: { id: AdminTab; label: string; description: string }[] = [
  {
    id: "moderation",
    label: "Moderation",
    description: "Review reports and manage content",
  },
  {
    id: "seed-products",
    label: "Seed Products",
    description: "Bulk seed products into Hobbyrider",
  },
  {
    id: "visibility",
    label: "Visibility",
    description: "Manage product views and upvotes",
  },
]

type AdminTabsProps = {
  initialReports?: any[]
  initialArchivedReports?: any[]
  initialProducts?: any[]
  initialClaims?: any[]
  initialProductsWithStats?: any[]
}

export function AdminTabs({ 
  initialReports = [],
  initialArchivedReports = [],
  initialProducts = [],
  initialClaims = [],
  initialProductsWithStats = []
}: AdminTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get("tab") as AdminTab) || "moderation"

  const handleTabChange = (tabId: AdminTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`/admin?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto hide-scrollbar" aria-label="Admin tabs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900
                  ${
                    isActive
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {currentTab === "moderation" && (
          <ModerationTab 
            initialReports={initialReports}
            initialArchivedReports={initialArchivedReports}
            initialProducts={initialProducts}
            initialClaims={initialClaims}
          />
        )}
        {currentTab === "seed-products" && <SeedProductsTab />}
        {currentTab === "visibility" && (
          <VisibilityTab initialProducts={initialProductsWithStats} />
        )}
      </div>
    </div>
  )
}
