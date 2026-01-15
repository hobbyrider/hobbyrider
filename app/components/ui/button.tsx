import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost" | "success"
type ButtonSize = "sm" | "base" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

/**
 * Button - Reusable button component with consistent variants
 * 
 * Variants:
 * - primary: Black background, white text (main actions)
 * - secondary: White background, gray border (secondary actions)
 * - ghost: No background, hover state (tertiary actions)
 * - success: Green background (success/upvoted state)
 * 
 * Sizes:
 * - sm: Small (px-2 py-1 text-sm)
 * - base: Default (px-3 py-1.5 text-sm)
 * - lg: Large (px-4 py-2 text-base)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "base", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-900",
      secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
      success: "bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400",
    }
    
    const sizes = {
      sm: "px-2 py-1 text-sm",
      base: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
