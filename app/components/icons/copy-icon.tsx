type CopyIconProps = {
  className?: string
}

export function CopyIcon({ className = "w-5 h-5" }: CopyIconProps) {
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
      <rect x="4" y="4" width="10" height="12" rx="1.5" />
      <rect x="6" y="6" width="10" height="12" rx="1.5" />
    </svg>
  )
}
