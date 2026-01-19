"use client"

type OwnershipBadgeProps = {
  status: "seeded" | "claimed" | "owned"
  className?: string
}

export function OwnershipBadge({ status, className = "" }: OwnershipBadgeProps) {
  const config = {
    seeded: {
      label: "Seeded by Hobbyrider",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    claimed: {
      label: "Ownership Claimed",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    owned: {
      label: "Owned",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
  }

  const { label, bgColor, textColor } = config[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor} ${className}`}
    >
      {label}
    </span>
  )
}
