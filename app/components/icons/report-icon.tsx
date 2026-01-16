type ReportIconProps = {
  className?: string
}

export function ReportIcon({ className = "w-5 h-5" }: ReportIconProps) {
  // Flag/report icon - standard flag design
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3l1.5 6L3 12h14l-1.5-3L17 3H3z" />
      <path d="M3 12v5" />
    </svg>
  )
}
