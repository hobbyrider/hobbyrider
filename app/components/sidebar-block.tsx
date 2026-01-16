import { ReactNode } from "react"

type SidebarBlockProps = {
  title?: string
  children: ReactNode
  className?: string
}

/**
 * SidebarBlock - Reusable container for sidebar content
 * 
 * Provides consistent styling and spacing for sidebar sections.
 * Used for voting, builder info, related content, etc.
 */
export function SidebarBlock({ title, children, className = "" }: SidebarBlockProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 ${className}`}>
      {title && (
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
      )}
      <div>{children}</div>
    </div>
  )
}
