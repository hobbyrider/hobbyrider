type CommentIconProps = {
  className?: string
}

export function CommentIcon({ className = "w-5 h-5" }: CommentIconProps) {
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
      <path d="M10 3c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.188 1.705.338 2.57.45v3.025a.75.75 0 001.163.638l3.086-2.126a26.75 26.75 0 001.88-.128c2.14-.344 4.334-.524 6.57-.524h.25a.75.75 0 00.75-.75v-5.148c0-1.413-.993-2.67-2.43-2.902A41.403 41.403 0 0010 3z" />
    </svg>
  )
}
