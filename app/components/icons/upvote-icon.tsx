type UpvoteIconProps = {
  className?: string
  filled?: boolean
}

export function UpvoteIcon({ className = "w-5 h-5", filled = false }: UpvoteIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 6l-4 4h8l-4-4z" />
    </svg>
  )
}
