import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "elevated"
}

/**
 * Card - Reusable card component with consistent styling
 * 
 * Variants:
 * - default: Basic white card with border
 * - hover: Adds hover background change
 * - elevated: Adds shadow for emphasis
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "rounded-xl border border-gray-200 bg-white"
    
    const variants = {
      default: "",
      hover: "transition-colors hover:bg-gray-50",
      elevated: "shadow-sm",
    }
    
    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"
