type CommentIconProps = {
  className?: string
}

export function CommentIcon({ className = "w-5 h-5" }: CommentIconProps) {
  // Standard chat bubble icon - clean and universally recognized
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
      <path d="M10 3a7 7 0 00-7 7c0 1.093.277 2.12.764 3.014l-1.014 3.486a.75.75 0 00.9.9l3.486-1.014A7 7 0 1010 3z" />
    </svg>
  )
}
