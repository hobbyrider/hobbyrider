type UpvoteIconProps = {
  className?: string
  filled?: boolean
}

export function UpvoteIcon({ className = "w-5 h-5", filled = false }: UpvoteIconProps) {
  // Standard chevron up icon - clean and recognizable
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.47 6.47a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 01-1.06-1.06l4.25-4.25z"
          clipRule="evenodd"
        />
      </svg>
    )
  }
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12.5l5-5 5 5" />
    </svg>
  )
}
