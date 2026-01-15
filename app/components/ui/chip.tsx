import { HTMLAttributes, forwardRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "button" | typeof Link
  href?: string
  variant?: "default" | "hover"
}

/**
 * Chip - Small badge/tag component for categories and labels
 * 
 * Variants:
 * - default: Static chip
 * - hover: Adds hover state for interactive chips
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, as = "span", variant = "default", href, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
    
    const variants = {
      default: "",
      hover: "transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-700",
    }
    
    const combinedClassName = cn(baseStyles, variants[variant], className)
    
    if (as === Link && href) {
      return (
        <Link
          href={href}
          className={combinedClassName}
          {...(props as any)}
        >
          {children}
        </Link>
      )
    }
    
    if (as === "button") {
      return (
        <button
          ref={ref}
          className={combinedClassName}
          {...(props as any)}
        >
          {children}
        </button>
      )
    }
    
    return (
      <span
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Chip.displayName = "Chip"
