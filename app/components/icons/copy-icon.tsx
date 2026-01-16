type CopyIconProps = {
  className?: string
}

export function CopyIcon({ className = "w-5 h-5" }: CopyIconProps) {
  // Standard link icon for "Copy URL" - cleaner and more recognizable
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
      <path d="M8.464 5.464a3 3 0 014.243 0l2.828 2.829a3 3 0 01-4.243 4.242l-.707-.707M8.464 5.464L7.757 6.17m3.535 6.364l.707.707m0 0l2.829 2.828a3 3 0 01-4.243 4.243l-2.828-2.829m4.243 0L7.757 13.536" />
    </svg>
  )
}
